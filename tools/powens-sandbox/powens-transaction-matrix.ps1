[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$reportPath = Join-Path $PSScriptRoot 'POWENS_TRANSACTION_MATRIX.md'
$baseUri = $null
$http = $null
$userToken = $null

function Get-EnvValue {
    param([Parameter(Mandatory)][string]$Name)

    foreach ($scope in @('Process', 'User', 'Machine')) {
        $value = [Environment]::GetEnvironmentVariable($Name, $scope)
        if (-not [string]::IsNullOrWhiteSpace($value)) { return $value }
    }
    $null
}

function Get-JsonProperty {
    param([AllowNull()][object]$Object, [Parameter(Mandatory)][string]$Name)

    if ($null -eq $Object) { return $null }
    $property = $Object.PSObject.Properties[$Name]
    if ($null -eq $property) { return $null }
    $property.Value
}

function Get-FirstProperty {
    param([AllowNull()][object]$Object, [Parameter(Mandatory)][string[]]$Names)

    foreach ($name in $Names) {
        $value = Get-JsonProperty $Object $name
        if ($null -ne $value -and -not [string]::IsNullOrWhiteSpace("$value")) { return $value }
    }
    $null
}

function Get-ReportText {
    param([AllowNull()][object]$Value)

    if ($null -eq $Value) { return '' }
    $text = "$Value" -replace '[\r\n|]', ' '
    if ([string]::IsNullOrWhiteSpace($text)) { return '' }
    $text.Substring(0, [Math]::Min(100, $text.Length)).Trim()
}

function Convert-ToRequestUri {
    param([Parameter(Mandatory)][string]$Path)

    $uri = if ($Path -match '^https://') {
        [uri]$Path
    } else {
        [uri]"$baseUri/$($Path.TrimStart('/'))"
    }
    $base = [uri]$baseUri
    if ($uri.Scheme -ne 'https' -or $uri.Host -ne $base.Host -or $uri.Query -match '(?i)(token|secret|password|authorization)=') {
        throw 'Unsafe request URI refused.'
    }
    $uri
}

function Invoke-PowensApi {
    param(
        [Parameter(Mandatory)][ValidateSet('GET', 'POST')][string]$Method,
        [Parameter(Mandatory)][string]$Path,
        [AllowEmptyString()][string]$Token = '',
        [AllowNull()][string]$Body = $null
    )

    $request = [System.Net.Http.HttpRequestMessage]::new(
        [System.Net.Http.HttpMethod]$Method,
        (Convert-ToRequestUri $Path)
    )
    try {
        if (-not [string]::IsNullOrWhiteSpace($Token)) {
            $request.Headers.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $Token)
        }
        if ($null -ne $Body) {
            $request.Content = [System.Net.Http.StringContent]::new($Body, [Text.Encoding]::UTF8, 'application/json')
        }
        $response = $http.SendAsync($request).GetAwaiter().GetResult()
        try {
            $raw = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            $json = $null
            if (-not [string]::IsNullOrWhiteSpace($raw)) {
                try { $json = $raw | ConvertFrom-Json } catch { $json = $null }
            }
            [pscustomobject]@{
                Status = [int]$response.StatusCode
                Json = $json
            }
        } finally {
            $response.Dispose()
        }
    } finally {
        $request.Dispose()
    }
}

function Assert-Success {
    param([Parameter(Mandatory)][object]$Response)

    if ($Response.Status -lt 200 -or $Response.Status -ge 300 -or $null -eq $Response.Json) {
        throw "Powens HTTP $($Response.Status)"
    }
}

function Get-PaginatedCollection {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$CollectionName
    )

    $items = [System.Collections.Generic.List[object]]::new()
    $statusCodes = [System.Collections.Generic.HashSet[string]]::new()
    $nextPath = $Path
    $page = 0
    while ($null -ne $nextPath -and $page -lt 100) {
        $page++
        $response = Invoke-PowensApi -Method GET -Path $nextPath -Token $userToken
        Assert-Success $response
        $null = $statusCodes.Add("$($response.Status)")
        foreach ($item in @(Get-JsonProperty $response.Json $CollectionName)) { $items.Add($item) }
        $links = Get-JsonProperty $response.Json '_links'
        $next = Get-JsonProperty (Get-JsonProperty $links 'next') 'href'
        $nextPath = if ([string]::IsNullOrWhiteSpace("$next")) { $null } else { "$next" }
    }
    [pscustomobject]@{
        Items = $items
        Pages = $page
        StatusCodes = $statusCodes
    }
}

function Get-ValueKind {
    param([AllowNull()][object]$Value)

    if ($null -eq $Value) { return 'null' }
    if ($Value -is [bool]) { return 'boolean' }
    if ($Value -is [System.Array]) { return 'array' }
    if ($Value -is [System.Collections.IDictionary] -or $Value -is [pscustomobject]) { return 'object' }
    if ($Value -is [string]) { return 'string' }
    if ($Value -is [int] -or $Value -is [long] -or $Value -is [short] -or $Value -is [uint] -or $Value -is [ulong]) { return 'integer' }
    if ($Value -is [decimal] -or $Value -is [double] -or $Value -is [single]) { return 'decimal' }
    "$($Value.GetType().Name)"
}

function New-FieldStat {
    [pscustomobject]@{
        KeyCount = 0
        NonNullCount = 0
        NullCount = 0
        Types = [System.Collections.Generic.HashSet[string]]::new()
        AccountTypes = [System.Collections.Generic.HashSet[string]]::new()
        Connectors = [System.Collections.Generic.HashSet[string]]::new()
        Accounts = [System.Collections.Generic.HashSet[string]]::new()
        TransactionTypes = [System.Collections.Generic.HashSet[string]]::new()
        EnumValues = [System.Collections.Generic.HashSet[string]]::new()
        DistinctValueCount = [System.Collections.Generic.HashSet[string]]::new()
    }
}

function Add-FieldObservation {
    param(
        [Parameter(Mandatory)][hashtable]$Stats,
        [Parameter(Mandatory)][string]$Path,
        [AllowNull()][object]$Value,
        [Parameter(Mandatory)][string]$AccountType,
        [Parameter(Mandatory)][string]$Connector,
        [Parameter(Mandatory)][string]$Account,
        [Parameter(Mandatory)][string]$TransactionType,
        [AllowNull()][hashtable]$CaseStats = $null
    )

    if (-not $Stats.ContainsKey($Path)) { $Stats[$Path] = New-FieldStat }
    $stat = $Stats[$Path]
    $stat.KeyCount++
    $null = $stat.Types.Add((Get-ValueKind $Value))
    $null = $stat.AccountTypes.Add($AccountType)
    $null = $stat.Connectors.Add($Connector)
    $null = $stat.Accounts.Add($Account)
    $null = $stat.TransactionTypes.Add($TransactionType)
    if ($null -eq $Value) {
        $stat.NullCount++
    } else {
        $stat.NonNullCount++
        if ($Path -in @('transaction.type', 'transaction.state')) {
            $null = $stat.EnumValues.Add("$Value")
        }
        if ($Path -eq 'transaction.id_category') {
            $null = $stat.DistinctValueCount.Add("$Value")
        }
    }

    if ($null -ne $CaseStats) {
        $caseKey = "$TransactionType|$Path"
        Add-FieldObservation -Stats $CaseStats -Path $caseKey -Value $Value -AccountType $AccountType -Connector $Connector -Account $Account -TransactionType $TransactionType
    }
}

function Add-FieldTree {
    param(
        [Parameter(Mandatory)][hashtable]$Stats,
        [Parameter(Mandatory)][string]$Path,
        [AllowNull()][object]$Value,
        [Parameter(Mandatory)][string]$AccountType,
        [Parameter(Mandatory)][string]$Connector,
        [Parameter(Mandatory)][string]$Account,
        [Parameter(Mandatory)][string]$TransactionType,
        [AllowNull()][hashtable]$CaseStats = $null,
        [int]$Depth = 0
    )

    Add-FieldObservation -Stats $Stats -Path $Path -Value $Value -AccountType $AccountType -Connector $Connector -Account $Account -TransactionType $TransactionType -CaseStats $CaseStats
    if ($null -eq $Value -or $Depth -ge 3) { return }
    if ($Value -is [System.Collections.IDictionary] -or $Value -is [pscustomobject]) {
        foreach ($property in @($Value.PSObject.Properties)) {
            Add-FieldTree -Stats $Stats -Path "$Path.$($property.Name)" -Value $property.Value -AccountType $AccountType -Connector $Connector -Account $Account -TransactionType $TransactionType -CaseStats $CaseStats -Depth ($Depth + 1)
        }
    }
}

function Increment-NestedCount {
    param([Parameter(Mandatory)][hashtable]$Table, [Parameter(Mandatory)][string]$Outer, [Parameter(Mandatory)][string]$Inner)

    if (-not $Table.ContainsKey($Outer)) { $Table[$Outer] = @{} }
    if (-not $Table[$Outer].ContainsKey($Inner)) { $Table[$Outer][$Inner] = 0 }
    $Table[$Outer][$Inner]++
}

$fieldDefinitions = [ordered]@{
    'transaction.id' = @('official', 'Transaction identifier')
    'transaction.id_account' = @('official', 'Related account identifier')
    'transaction.application_date' = @('official', 'PFM application date; editable')
    'transaction.date' = @('official', 'Posting date')
    'transaction.datetime' = @('official', 'Posting date and time in UTC')
    'transaction.vdate' = @('official', 'Value date')
    'transaction.vdatetime' = @('official', 'Value date and time in UTC')
    'transaction.rdate' = @('official', 'Date the order was given')
    'transaction.rdatetime' = @('official', 'Date and time the order was given')
    'transaction.bdate' = @('deprecated', 'Bank-displayed date; use date')
    'transaction.bdatetime' = @('deprecated', 'Bank-displayed date-time; use datetime')
    'transaction.value' = @('official', 'Transaction value')
    'transaction.gross_value' = @('official', 'Gross transaction value')
    'transaction.type' = @('official', 'Transaction type enum')
    'transaction.original_wording' = @('official', 'Full bank label')
    'transaction.simplified_wording' = @('official', 'Simplified label')
    'transaction.wording' = @('official', 'Editable transaction label')
    'transaction.date_scraped' = @('official', 'Date and time seen by Powens')
    'transaction.coming' = @('official', 'Not yet posted when true')
    'transaction.active' = @('official', 'Included by PFM services when true')
    'transaction.id_cluster' = @('official', 'Cluster identifier')
    'transaction.comment' = @('official', 'User comment')
    'transaction.last_update' = @('official', 'Last update')
    'transaction.deleted' = @('official', 'Removal date when deleted')
    'transaction.original_value' = @('official', 'Value in original currency')
    'transaction.original_gross_value' = @('official', 'Gross value in original currency')
    'transaction.original_currency' = @('official', 'Original currency')
    'transaction.commission' = @('official', 'Commission')
    'transaction.commission_currency' = @('official', 'Commission currency')
    'transaction.country' = @('deprecated', 'Original country; deprecated')
    'transaction.card' = @('official', 'Associated card number or marker')
    'transaction.counterparty' = @('official', 'Optional business or individual counterparty')
    'transaction.counterparty.label' = @('official', 'Counterparty label')
    'transaction.counterparty.account_scheme_name' = @('official', 'Counterparty account scheme')
    'transaction.counterparty.account_identification' = @('official', 'Counterparty account identification')
    'transaction.counterparty.type' = @('official', 'Counterparty role: creditor or debtor')
    'transaction.id_category' = @('observed-extension', 'Observed Sandbox category identifier; do not infer meaning without mapping')
    'transaction.state' = @('observed-extension', 'Observed Sandbox field; not part of the documented core table')
    'transaction.formatted_value' = @('observed-extension', 'Observed display-formatted value')
    'transaction.documents_count' = @('observed-extension', 'Observed count of related documents')
    'transaction.webid' = @('observed-extension', 'Observed provider/web identifier')
    'transaction.informations' = @('observed-extension', 'Observed extensible information object')
    'transaction.details' = @('observed-extension', 'Observed optional details object')
    'transaction.categories' = @('optional-expand', 'Documented category expansion; tested separately')
    'transaction.attachments' = @('optional-expand', 'Documented attachment expansion; tested separately')
}

$fieldStats = @{}
$fieldCaseStats = @{}
$accountMap = @{}
$accountIdsByLabel = @{}
$accountMatrix = [System.Collections.Generic.List[object]]::new()
$transactionCountsByAccount = @{}
$connectorStats = @{}
$transactionTypesByAccountType = @{}
$counterpartyByTransactionType = @{}
$expansionResults = [System.Collections.Generic.List[object]]::new()
$transactions = [System.Collections.Generic.List[object]]::new()

try {
    $baseRaw = Get-EnvValue 'POWENS_BASE_URL'
    $userId = Get-EnvValue 'POWENS_USER_ID'
    $existingToken = Get-EnvValue 'POWENS_USER_TOKEN'
    $requiredNames = [System.Collections.Generic.List[string]]::new()
    if ([string]::IsNullOrWhiteSpace($baseRaw)) { $requiredNames.Add('POWENS_BASE_URL') }
    if ([string]::IsNullOrWhiteSpace($userId)) { $requiredNames.Add('POWENS_USER_ID') }
    if ([string]::IsNullOrWhiteSpace($existingToken)) {
        if ([string]::IsNullOrWhiteSpace((Get-EnvValue 'POWENS_CLIENT_ID'))) { $requiredNames.Add('POWENS_CLIENT_ID') }
        if ([string]::IsNullOrWhiteSpace((Get-EnvValue 'POWENS_CLIENT_SECRET'))) { $requiredNames.Add('POWENS_CLIENT_SECRET') }
    }
    if ($requiredNames.Count -gt 0) {
        Write-Output $requiredNames[0]
        exit 2
    }

    $parsedBase = [uri]$baseRaw
    if ($parsedBase.Scheme -ne 'https' -or $parsedBase.Host -notmatch '(?i)sandbox' -or $parsedBase.AbsolutePath.TrimEnd('/') -ne '/2.0' -or $parsedBase.UserInfo -or $parsedBase.Query -or $parsedBase.Fragment) {
        throw 'Invalid Sandbox base URL.'
    }
    $baseUri = $parsedBase.AbsoluteUri.TrimEnd('/')
    Add-Type -AssemblyName System.Net.Http
    $http = [System.Net.Http.HttpClient]::new()
    $http.Timeout = [TimeSpan]::FromSeconds(30)

    if (-not [string]::IsNullOrWhiteSpace($existingToken)) {
        $userToken = $existingToken
    } else {
        $renewBody = @{
            grant_type = 'client_credentials'
            client_id = Get-EnvValue 'POWENS_CLIENT_ID'
            client_secret = Get-EnvValue 'POWENS_CLIENT_SECRET'
            id_user = $userId
            revoke_previous = $false
        } | ConvertTo-Json -Compress
        $renew = Invoke-PowensApi -Method POST -Path 'auth/renew' -Body $renewBody
        Assert-Success $renew
        $userToken = Get-FirstProperty $renew.Json @('access_token', 'token')
        if ([string]::IsNullOrWhiteSpace("$userToken")) { throw 'Token utilisateur absent.' }
    }

    $userRoute = "users/$userId"
    $connectionsResponse = Invoke-PowensApi -Method GET -Path "$userRoute/connections" -Token $userToken
    Assert-Success $connectionsResponse
    $connectionMap = @{}
    $connectionIndex = 0
    foreach ($connection in @(Get-JsonProperty $connectionsResponse.Json 'connections')) {
        $connectionIndex++
        $connectionId = Get-FirstProperty $connection @('id', 'id_connection')
        $connectorRef = Get-FirstProperty $connection @('connector_uuid', 'id_connector')
        if ($null -eq $connectorRef) { continue }
        $connectorResponse = Invoke-PowensApi -Method GET -Path "connectors/$connectorRef"
        Assert-Success $connectorResponse
        $connector = $connectorResponse.Json
        $connectorName = Get-FirstProperty $connector @('name', 'slug')
        if ([string]::IsNullOrWhiteSpace("$connectorName")) { $connectorName = 'UNKNOWN' }
        $connectionLabel = "CONNECTION_{0:D2}" -f $connectionIndex
        $connectorStats["$connectorName"] = [pscustomobject]@{
            Name = $connectorName
            MonthsToFetch = Get-JsonProperty $connector 'months_to_fetch'
            AccountTypes = [System.Collections.Generic.HashSet[string]]::new()
            Accounts = 0
            Transactions = 0
        }
        $connectionMap["$connectionId"] = [pscustomobject]@{
            Label = $connectionLabel
            Connector = $connectorName
            MonthsToFetch = Get-JsonProperty $connector 'months_to_fetch'
        }
    }

    $accountsResponse = Invoke-PowensApi -Method GET -Path "$userRoute/accounts" -Token $userToken
    Assert-Success $accountsResponse
    $accountIndex = 0
    foreach ($account in @(Get-JsonProperty $accountsResponse.Json 'accounts')) {
        $accountIndex++
        $accountId = Get-FirstProperty $account @('id', 'id_account')
        if ($null -eq $accountId) { continue }
        $connectionId = Get-FirstProperty $account @('id_connection', 'connection_id')
        $accountType = Get-ReportText (Get-JsonProperty $account 'type')
        if ([string]::IsNullOrWhiteSpace($accountType)) { $accountType = 'UNKNOWN' }
        $accountLabel = "ACCOUNT_{0:D2}" -f $accountIndex
        $connectionInfo = if ($null -ne $connectionId -and $connectionMap.ContainsKey("$connectionId")) { $connectionMap["$connectionId"] } else { $null }
        $connectionLabel = if ($null -ne $connectionInfo) { $connectionInfo.Label } else { 'CONNECTION_UNKNOWN' }
        $connectorName = if ($null -ne $connectionInfo) { $connectionInfo.Connector } else { 'UNKNOWN' }
        $accountMap["$accountId"] = [pscustomobject]@{
            Account = $accountLabel
            Connection = $connectionLabel
            Type = $accountType
            Connector = $connectorName
        }
        $accountIdsByLabel[$accountLabel] = "$accountId"
        $accountMatrix.Add([pscustomobject]@{
            Account = $accountLabel
            Connection = $connectionLabel
            Connector = $connectorName
            Type = $accountType
            Transactions = 0
        })
        $transactionCountsByAccount[$accountLabel] = 0
        if (-not $connectorStats.ContainsKey($connectorName)) {
            $connectorStats[$connectorName] = [pscustomobject]@{
                Name = $connectorName
                MonthsToFetch = $null
                AccountTypes = [System.Collections.Generic.HashSet[string]]::new()
                Accounts = 0
                Transactions = 0
            }
        }
        $connectorStats[$connectorName].Accounts++
        $null = $connectorStats[$connectorName].AccountTypes.Add($accountType)
    }

    $aggregatePath = "$userRoute/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01"
    $aggregateTransactions = Get-PaginatedCollection -Path $aggregatePath -CollectionName 'transactions'
    foreach ($transaction in $aggregateTransactions.Items) { $transactions.Add($transaction) }
    $page = $aggregateTransactions.Pages

    foreach ($transaction in $transactions) {
        $accountId = Get-FirstProperty $transaction @('id_account', 'account_id')
        $accountInfo = if ($null -ne $accountId -and $accountMap.ContainsKey("$accountId")) { $accountMap["$accountId"] } else { [pscustomobject]@{ Account = 'ACCOUNT_UNKNOWN'; Connection = 'CONNECTION_UNKNOWN'; Type = 'UNKNOWN'; Connector = 'UNKNOWN' } }
        $transactionType = Get-ReportText (Get-JsonProperty $transaction 'type')
        if ([string]::IsNullOrWhiteSpace($transactionType)) { $transactionType = 'UNKNOWN' }
        if ($transactionCountsByAccount.ContainsKey($accountInfo.Account)) { $transactionCountsByAccount[$accountInfo.Account]++ }
        Increment-NestedCount $transactionTypesByAccountType $accountInfo.Type $transactionType
        $counterparty = Get-JsonProperty $transaction 'counterparty'
        if ($null -ne $counterparty) {
            Increment-NestedCount $counterpartyByTransactionType $transactionType 'objects_total'
            foreach ($name in @('label', 'account_scheme_name', 'account_identification')) {
                if ($null -ne (Get-JsonProperty $counterparty $name)) { Increment-NestedCount $counterpartyByTransactionType $transactionType "${name}_non_null" }
            }
            $counterpartyType = Get-ReportText (Get-JsonProperty $counterparty 'type')
            if ([string]::IsNullOrWhiteSpace($counterpartyType)) { $counterpartyType = 'null' }
            Increment-NestedCount $counterpartyByTransactionType $transactionType "role_$counterpartyType"
        }
        foreach ($property in @($transaction.PSObject.Properties)) {
            Add-FieldTree -Stats $fieldStats -Path "transaction.$($property.Name)" -Value $property.Value -AccountType $accountInfo.Type -Connector $accountInfo.Connector -Account $accountInfo.Account -TransactionType $transactionType -CaseStats $fieldCaseStats
        }
        if ($connectorStats.ContainsKey($accountInfo.Connector)) { $connectorStats[$accountInfo.Connector].Transactions++ }
    }

    foreach ($accountRow in $accountMatrix) {
        $accountRow.Transactions = $transactionCountsByAccount[$accountRow.Account]
        $accountId = $accountIdsByLabel[$accountRow.Account]
        foreach ($expansion in @('categories', 'attachments')) {
            $expansionPath = "$userRoute/accounts/$accountId/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01&expand=$expansion"
            $expanded = Get-PaginatedCollection -Path $expansionPath -CollectionName 'transactions'
            $propertyPresent = 0
            $nonEmpty = 0
            $elementCount = 0
            $fileIndicators = 0
            $linkIndicators = 0
            $structureKeys = [System.Collections.Generic.HashSet[string]]::new()
            foreach ($transaction in $expanded.Items) {
                $property = Get-JsonProperty $transaction $expansion
                if ($null -ne $property) { $propertyPresent++ }
                $elements = @($property)
                if ($elements.Count -gt 0) { $nonEmpty++ }
                foreach ($element in $elements) {
                    if ($null -eq $element) { continue }
                    $elementCount++
                    foreach ($elementProperty in @($element.PSObject.Properties)) {
                        $null = $structureKeys.Add("$expansion.$($elementProperty.Name)")
                        if ($elementProperty.Name -match '(?i)(url|link|href)') { $linkIndicators++ }
                        if ($elementProperty.Name -match '(?i)(file|thumb|attachment|document)') { $fileIndicators++ }
                    }
                }
            }
            $expansionResults.Add([pscustomobject]@{
                Account = $accountRow.Account
                Connection = $accountRow.Connection
                Type = $accountRow.Type
                Expansion = $expansion
                Pages = $expanded.Pages
                StatusCodes = (@($expanded.StatusCodes | Sort-Object) -join ', ')
                TransactionsRead = $expanded.Items.Count
                PropertyPresent = $propertyPresent
                NonEmptyTransactions = $nonEmpty
                Elements = $elementCount
                FileIndicators = $fileIndicators
                LinkIndicators = $linkIndicators
                StructureKeys = (@($structureKeys | Sort-Object) -join ', ')
            })
        }
    }

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add('# Powens Sandbox - matrice transactionnelle')
    $lines.Add('')
    $lines.Add('- Corpus : transactions actives retournées par `GET /users/{userId}/transactions`, pagination suivie jusqu''à la fin.')
    $lines.Add('- Le rapport ne conserve aucun montant, libellé, identifiant, token, secret ou valeur brute.')
    $lines.Add("- Transactions analysées : $($transactions.Count)")
    $lines.Add("- Comptes analysés : $($accountMap.Count)")
    $lines.Add("- Pages transactionnelles lues : $page")
    $observedTopLevelCount = @($fieldStats.Keys | Where-Object { $_ -match '^transaction\.[^.]+$' }).Count
    $observedNestedCount = @($fieldStats.Keys | Where-Object { $_ -match '^transaction\.[^.]+\.' }).Count
    $lines.Add("- Champs top-level observés dans la réponse de base : $observedTopLevelCount")
    $lines.Add("- Sous-champs JSON observés : $observedNestedCount")
    $lines.Add('')
    $lines.Add('## Matrice connexion / compte')
    $lines.Add('')
    $lines.Add('- Les libellés `CONNECTION_nn` et `ACCOUNT_nn` sont des positions locales anonymisées ; aucun identifiant bancaire n''est conservé.')
    $lines.Add('')
    $lines.Add('| Connexion | Compte | Connector | Type technique | Transactions |')
    $lines.Add('|---|---|---|---|---:|')
    foreach ($accountRow in $accountMatrix) {
        $lines.Add("| $($accountRow.Connection) | $($accountRow.Account) | $($accountRow.Connector) | $($accountRow.Type) | $($accountRow.Transactions) |")
    }
    $lines.Add('')
    $lines.Add('## Matrice des champs')
    $lines.Add('')
    $lines.Add('- `official` : champ décrit par la documentation Transactions.')
    $lines.Add('- `deprecated` : champ encore observable mais déconseillé par Powens.')
    $lines.Add('- `observed-extension` : champ observé dans le Sandbox mais hors tableau transactionnel documenté.')
    $lines.Add('- `optional-expand` : champ obtenu uniquement avec une expansion documentée.')
    $lines.Add('')
    $lines.Add('| Chemin JSON | Statut | Signification | Clé présente | Non-null | Null | Types observés | Types de comptes | Connectors | Comptes touchés | Types transaction | Valeurs sûres |')
    $lines.Add('|---|---|---|---:|---:|---:|---|---|---|---:|---|---|')
    $paths = @($fieldDefinitions.Keys + $fieldStats.Keys | Sort-Object -Unique)
    foreach ($path in $paths) {
        $definition = if ($fieldDefinitions.Contains($path)) { $fieldDefinitions[$path] } else { @('observed-extension', 'Champ observé dans le Sandbox') }
        $stat = if ($fieldStats.ContainsKey($path)) { $fieldStats[$path] } else { $null }
        $keyCount = if ($null -eq $stat) { 0 } else { $stat.KeyCount }
        $nonNull = if ($null -eq $stat) { 0 } else { $stat.NonNullCount }
        $nullCount = if ($null -eq $stat) { 0 } else { $stat.NullCount }
        $types = if ($null -eq $stat) { '' } else { (@($stat.Types | Sort-Object) -join ', ') }
        $accountTypes = if ($null -eq $stat) { '' } else { (@($stat.AccountTypes | Sort-Object) -join ', ') }
        $connectors = if ($null -eq $stat) { '' } else { (@($stat.Connectors | Sort-Object) -join ', ') }
        $accounts = if ($null -eq $stat) { 0 } else { $stat.Accounts.Count }
        $transactionTypes = if ($null -eq $stat) { '' } else { (@($stat.TransactionTypes | Sort-Object) -join ', ') }
        $safeValues = ''
        if ($null -ne $stat -and $path -in @('transaction.type', 'transaction.state')) { $safeValues = @($stat.EnumValues | Sort-Object) -join ', ' }
        if ($null -ne $stat -and $path -eq 'transaction.id_category') { $safeValues = "distinct=$($stat.DistinctValueCount.Count); values omitted" }
        $lines.Add("| ``$path`` | $($definition[0]) | $($definition[1]) | $keyCount | $nonNull | $nullCount | $types | $accountTypes | $connectors | $accounts | $transactionTypes | $safeValues |")
    }

    $lines.Add('')
    $lines.Add('## Matrice champ × type de transaction')
    $lines.Add('')
    $lines.Add('| Chemin JSON | Type transaction | Non-null | Null | Comptes touchés |')
    $lines.Add('|---|---|---:|---:|---:|')
    foreach ($caseKey in @($fieldCaseStats.Keys | Sort-Object)) {
        $separator = $caseKey.IndexOf('|')
        $transactionType = $caseKey.Substring(0, $separator)
        $path = $caseKey.Substring($separator + 1)
        $stat = $fieldCaseStats[$caseKey]
        $lines.Add("| ``$path`` | $transactionType | $($stat.NonNullCount) | $($stat.NullCount) | $($stat.Accounts.Count) |")
    }

    $lines.Add('')
    $lines.Add('## Types de transactions par type de compte')
    $lines.Add('')
    $lines.Add('| Type de compte | Type transaction | Nombre |')
    $lines.Add('|---|---|---:|')
    foreach ($accountType in @($transactionTypesByAccountType.Keys | Sort-Object)) {
        foreach ($transactionType in @($transactionTypesByAccountType[$accountType].Keys | Sort-Object)) {
            $lines.Add("| $accountType | $transactionType | $($transactionTypesByAccountType[$accountType][$transactionType]) |")
        }
    }

    $lines.Add('')
    $lines.Add('## Contreparties par type de transaction')
    $lines.Add('')
    $lines.Add('| Type transaction | Objets contrepartie | Label non-null | Compte non-null | Identification non-null | Rôles observés |')
    $lines.Add('|---|---:|---:|---:|---:|---|')
    foreach ($transactionType in @($counterpartyByTransactionType.Keys | Sort-Object)) {
        $stats = $counterpartyByTransactionType[$transactionType]
        $roles = @($stats.Keys | Where-Object { $_ -like 'role_*' } | ForEach-Object { $_.Substring(5) } | Sort-Object) -join ', '
        $labelCount = if ($stats.ContainsKey('label_non_null')) { $stats.label_non_null } else { 0 }
        $schemeCount = if ($stats.ContainsKey('account_scheme_name_non_null')) { $stats.account_scheme_name_non_null } else { 0 }
        $identificationCount = if ($stats.ContainsKey('account_identification_non_null')) { $stats.account_identification_non_null } else { 0 }
        $objectCount = if ($stats.ContainsKey('objects_total')) { $stats.objects_total } else { 0 }
        $lines.Add("| $transactionType | $objectCount | $labelCount | $schemeCount | $identificationCount | $roles |")
    }

    $lines.Add('')
    $lines.Add('## Expansions categories / attachments')
    $lines.Add('')
    $lines.Add('| Connexion | Compte | Type de compte | Expansion | HTTP | Pages | Transactions lues | Propriété présente | Transactions non vides | Éléments | Indicateurs fichier | Indicateurs lien | Structure JSON |')
    $lines.Add('|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|')
    foreach ($expansionResult in $expansionResults) {
        $lines.Add("| $($expansionResult.Connection) | $($expansionResult.Account) | $($expansionResult.Type) | $($expansionResult.Expansion) | $($expansionResult.StatusCodes) | $($expansionResult.Pages) | $($expansionResult.TransactionsRead) | $($expansionResult.PropertyPresent) | $($expansionResult.NonEmptyTransactions) | $($expansionResult.Elements) | $($expansionResult.FileIndicators) | $($expansionResult.LinkIndicators) | $($expansionResult.StructureKeys) |")
    }

    $lines.Add('')
    $lines.Add('## Connectors et comptes')
    $lines.Add('')
    $lines.Add('| Connector | Comptes | Transactions | Types de comptes | months_to_fetch |')
    $lines.Add('|---|---:|---:|---|---:|')
    foreach ($connectorName in @($connectorStats.Keys | Sort-Object)) {
        $connector = $connectorStats[$connectorName]
        $months = if ($null -eq $connector.MonthsToFetch) { '' } else { "$($connector.MonthsToFetch)" }
        $lines.Add("| $connectorName | $($connector.Accounts) | $($connector.Transactions) | $(@($connector.AccountTypes | Sort-Object) -join ', ') | $months |")
    }

    $lines.Add('')
    $lines.Add('## Expansions et limites')
    $lines.Add('')
    $lines.Add('- `categories` et `attachments` ont été testés par compte avec des requêtes GET séparées ; aucun élément n''a été téléchargé.')
    $lines.Add('- Les colonnes d''indicateurs comptent uniquement la présence de noms de propriétés comme `url`, `file` ou `thumb_url`, jamais leur valeur.')
    $lines.Add('- Les valeurs brutes de `wording`, `counterparty.label`, montants et identifiants sont volontairement exclues de cette matrice.')
    $lines.Add('- Le corpus est celui d''un utilisateur Sandbox et des transactions actives retournées au moment du test ; il ne constitue pas une garantie pour tous les connectors.')
    $lines.Add('- `transaction.state` est conservé comme extension observée ; sa signification métier n''est pas déduite sans corpus/documentation complémentaire.')
    $lines.Add('')
    $lines.Add('## Sources')
    $lines.Add('')
    $lines.Add('- https://docs.powens.com/api-reference/products/data-aggregation/bank-transactions')
    $lines.Add('- https://docs.powens.com/api-reference/products/data-aggregation/bank-account-types')
    $lines.Add('- https://docs.powens.com/api-reference/user-connections/connectors')
    $lines.Add('- https://docs.powens.com/api-reference/products/data-aggregation/categorization')
    $lines.Add('- https://docs.powens.com/api-reference/products/data-aggregation/transactions-attachments')
    $lines | Set-Content -LiteralPath $reportPath -Encoding UTF8
    Write-Host "PASS MATRIX transactions=$($transactions.Count) report=$reportPath"
} catch {
    Write-Host "FAIL MATRIX error=$($_.Exception.GetType().Name)"
    exit 1
} finally {
    if ($null -ne $http) { $http.Dispose() }
}
