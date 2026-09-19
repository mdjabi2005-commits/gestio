[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$reportPath = Join-Path $PSScriptRoot 'HISTORY_DEPTH_REPORT.md'
$observations = [System.Collections.Generic.List[object]]::new()
$depthResults = [System.Collections.Generic.List[object]]::new()
$connectionDepthResults = [System.Collections.Generic.List[object]]::new()
$connectionDiagnostics = [System.Collections.Generic.List[object]]::new()
$documentResults = [System.Collections.Generic.List[object]]::new()
$baseUri = $null
$http = $null
$fatalError = $null
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

function Get-JsonShape {
    param([AllowNull()][object]$Json)

    if ($null -eq $Json) { return 'aucun JSON' }
    if ($Json -is [System.Array]) { return "JSON array; items=$($Json.Count)" }
    if ($Json -is [pscustomobject]) {
        $keys = @($Json.PSObject.Properties.Name | Sort-Object)
        $arrays = @($Json.PSObject.Properties | Where-Object { $_.Value -is [System.Array] } | ForEach-Object { "$($_.Name)[$($_.Value.Count)]" })
        $keyText = if ($keys.Count) { $keys -join ', ' } else { '(none)' }
        $arrayText = if ($arrays.Count) { "; arrays=$($arrays -join ', ')" } else { '' }
        return "JSON object; keys=$keyText$arrayText"
    }
    "JSON $($Json.GetType().Name)"
}

function Get-ErrorCode {
    param([AllowNull()][object]$Json)

    $code = Get-FirstProperty $Json @('code', 'error_code', 'error')
    if ($null -eq $code) { return '' }
    if ($code -is [string]) { return $code.Substring(0, [Math]::Min(120, $code.Length)) }
    'error'
}

function Convert-ToDate {
    param([AllowNull()][object]$Value)

    if ($null -eq $Value -or [string]::IsNullOrWhiteSpace("$Value")) { return $null }
    $parsed = [DateTimeOffset]::MinValue
    if ([DateTimeOffset]::TryParse(
            "$Value",
            [Globalization.CultureInfo]::InvariantCulture,
            [Globalization.DateTimeStyles]::AssumeUniversal,
            [ref]$parsed)) {
        return $parsed
    }
    $null
}

function Get-TransactionDate {
    param([AllowNull()][object]$Transaction)

    foreach ($name in @('date', 'application_date', 'rdate')) {
        $date = Convert-ToDate (Get-JsonProperty $Transaction $name)
        if ($null -ne $date) { return $date }
    }
    $null
}

function Get-DocumentDate {
    param([AllowNull()][object]$Document)

    foreach ($name in @('date', 'document_date', 'created_at', 'updated_at', 'duedate')) {
        $date = Convert-ToDate (Get-JsonProperty $Document $name)
        if ($null -ne $date) { return $date }
    }
    $null
}

function Get-CollectionItems {
    param([AllowNull()][object]$Json, [Parameter(Mandatory)][string]$CollectionName)

    $value = Get-JsonProperty $Json $CollectionName
    if ($null -eq $value) { return @() }
    if ($value -is [System.Array]) { return @($value) }
    @($value)
}

function Get-NextHref {
    param([AllowNull()][object]$Json)

    $links = Get-JsonProperty $Json '_links'
    $next = Get-JsonProperty $links 'next'
    $href = Get-JsonProperty $next 'href'
    if ([string]::IsNullOrWhiteSpace("$href")) { return $null }
    "$href"
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

    $uri = Convert-ToRequestUri $Path
    $request = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]$Method, $uri)
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
            $contentType = ''
            if ($null -ne $response.Content.Headers.ContentType) {
                $contentType = "$($response.Content.Headers.ContentType.MediaType)"
            }
            return [pscustomobject]@{
                Status = [int]$response.StatusCode
                Json = $json
                ContentType = $contentType
                Error = $null
            }
        } finally {
            $response.Dispose()
        }
    } catch {
        return [pscustomobject]@{
            Status = $null
            Json = $null
            ContentType = ''
            Error = $_.Exception.Message
        }
    } finally {
        $request.Dispose()
    }
}

function Add-Observation {
    param(
        [Parameter(Mandatory)][string]$Area,
        [Parameter(Mandatory)][string]$Method,
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$TokenRequired,
        [Parameter(Mandatory)][string]$RequiredParameters,
        [AllowNull()][object]$Response,
        [AllowEmptyString()][string]$Note = ''
    )

    $status = if ($null -eq $Response -or $null -eq $Response.Status) { 'client error' } else { "$($Response.Status)" }
    $shape = if ($null -eq $Response) { 'not checked' } else { Get-JsonShape $Response.Json }
    $result = if ($status -eq 'client error') { 'FAIL' }
        elseif ([int]$Response.Status -ge 200 -and [int]$Response.Status -lt 300) { 'PASS' }
        elseif ([int]$Response.Status -in @(401, 403, 404, 409)) { 'BLOCKED' }
        else { 'FAIL' }
    $code = if ($null -ne $Response) { Get-ErrorCode $Response.Json } else { '' }
    if ($status -eq 'client error') {
        $clientError = if ($null -ne $Response) { "$($Response.Error)" } else { '' }
        if ([string]::IsNullOrWhiteSpace($clientError)) { $clientError = 'client_error' }
        $clientError = [regex]::Replace($clientError, 'https?://\S+', '<url>')
        $clientError = [regex]::Replace($clientError, '(?i)\bBearer\s+\S+', 'Bearer <redacted>')
        $clientError = $clientError.Substring(0, [Math]::Min(240, $clientError.Length))
        $Note = if ([string]::IsNullOrWhiteSpace($Note)) { "client_error: $clientError" } else { "$Note; client_error: $clientError" }
    }
    if ([string]::IsNullOrWhiteSpace($Note) -and $result -in @('BLOCKED', 'FAIL')) {
        $Note = if ($code) { "HTTP $status; code=$code" } else { "HTTP $status" }
    }
    if ([string]::IsNullOrWhiteSpace($Note) -and $result -eq 'PASS') { $Note = 'HTTP succès; structure JSON inspectée, valeurs non enregistrées.' }

    $observations.Add([pscustomobject]@{
        Area = $Area
        Method = $Method
        Path = $Path
        TokenRequired = $TokenRequired
        RequiredParameters = $RequiredParameters
        Status = $status
        ContentType = if ($null -ne $Response) { $Response.ContentType } else { '' }
        Structure = $shape
        Result = $result
        Note = $Note
    })
    $consoleCode = if ($code) { " code=$code" } else { '' }
    Write-Host ("{0,-7} {1} {2} status={3}{4}" -f $result, $Method, $Path, $status, $consoleCode)
}

function Invoke-PowensCollection {
    param(
        [Parameter(Mandatory)][string]$Area,
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$DisplayPath,
        [Parameter(Mandatory)][string]$TokenRequired,
        [Parameter(Mandatory)][string]$RequiredParameters,
        [Parameter(Mandatory)][string]$CollectionName,
        [AllowEmptyString()][string]$Token = ''
    )

    $items = [System.Collections.Generic.List[object]]::new()
    $nextPath = $Path
    $page = 1
    $first = $null
    while ($page -le 100 -and $null -ne $nextPath) {
        $response = Invoke-PowensApi -Method GET -Path $nextPath -Token $Token
        Add-Observation $Area GET "$DisplayPath (page $page)" $TokenRequired $RequiredParameters $response
        if ($page -eq 1) { $first = $response }
        if ($null -eq $response.Json -or $response.Status -lt 200 -or $response.Status -ge 300) { break }
        foreach ($item in @(Get-CollectionItems $response.Json $CollectionName)) { $items.Add($item) }
        $nextPath = Get-NextHref $response.Json
        $page++
    }
    [pscustomobject]@{
        Items = @($items)
        FirstResponse = $first
        Pages = $page - 1
    }
}

function Get-MonthSpan {
    param([AllowNull()][object[]]$Items, [Parameter(Mandatory)][scriptblock]$DateSelector)

    $dates = [System.Collections.Generic.List[DateTimeOffset]]::new()
    foreach ($item in @($Items)) {
        $date = & $DateSelector $item
        if ($null -ne $date) { $dates.Add($date) }
    }
    if ($dates.Count -eq 0) {
        return [pscustomobject]@{ Count = @($Items).Count; Parsed = 0; FirstMonth = ''; LastMonth = ''; Months = $null; AtLeast24 = 'NO_DATA' }
    }
    $first = ($dates | Sort-Object)[0]
    $last = ($dates | Sort-Object)[-1]
    $months = (($last.Year - $first.Year) * 12) + $last.Month - $first.Month + 1
    [pscustomobject]@{
        Count = @($Items).Count
        Parsed = $dates.Count
        FirstMonth = $first.ToString('yyyy-MM')
        LastMonth = $last.ToString('yyyy-MM')
        Months = $months
        AtLeast24 = if ($months -ge 24) { 'YES' } else { 'NO' }
    }
}

function Get-ReportText {
    param([AllowNull()][object]$Value)

    if ($null -eq $Value) { return '' }
    $text = "$Value" -replace '[\r\n|]', ' '
    if ([string]::IsNullOrWhiteSpace($text)) { return '' }
    $text.Substring(0, [Math]::Min(100, $text.Length)).Trim()
}

function Get-ReportMonth {
    param([AllowNull()][object]$Value)

    $date = Convert-ToDate $Value
    if ($null -eq $date) { return 'UNKNOWN' }
    $date.ToString('yyyy-MM')
}

function Get-ReportMonthStatus {
    param([AllowNull()][object]$Object, [Parameter(Mandatory)][string]$Name)

    if ($null -eq $Object) { return 'UNKNOWN' }
    $property = $Object.PSObject.Properties[$Name]
    if ($null -eq $property) { return 'UNKNOWN' }
    if ($null -eq $property.Value) { return 'NOT_REPORTED' }
    Get-ReportMonth $property.Value
}

function Get-ConnectionLabel {
    param(
        [AllowNull()][object]$Connection,
        [Parameter(Mandatory)][int]$Index,
        [AllowNull()][object]$Connector = $null
    )

    $connector = if ($null -ne $Connector) { $Connector } else { Get-JsonProperty $Connection 'connector' }
    $label = Get-FirstProperty $connector @('name', 'code', 'slug')
    if ($null -eq $label) { $label = Get-FirstProperty $Connection @('connector_name', 'connectorName') }
    if ($null -eq $label) { return "CONNECTION_$('{0:D2}' -f $Index)" }
    $safe = Get-ReportText $label
    if ([string]::IsNullOrWhiteSpace($safe)) { return "CONNECTION_$('{0:D2}' -f $Index)" }
    $safe.Substring(0, [Math]::Min(60, $safe.Length))
}

function Get-DocumentSignals {
    param([AllowNull()][object]$Document)

    $statement = $false
    foreach ($name in @('type', 'type_name', 'document_type', 'name', 'label', 'category')) {
        $value = Get-JsonProperty $Document $name
        if ($null -ne $value -and "$value" -match '(?i)statement|relev') { $statement = $true }
    }
    $hasWebsiteFile = (Get-JsonProperty $Document 'has_file_on_website') -eq $true
    $fileId = Get-FirstProperty $Document @('id_file', 'file_id')
    $url = Get-FirstProperty $Document @('url', 'file_url', 'download_url')
    [pscustomobject]@{
        Statement = $statement
        WebsiteFile = $hasWebsiteFile
        FileId = $null -ne $fileId
        Url = $null -ne $url
    }
}

function Get-DocumentSummary {
    param([AllowNull()][object[]]$Items)

    $dates = [System.Collections.Generic.List[DateTimeOffset]]::new()
    $statement = 0
    $websiteFiles = 0
    $fileIds = 0
    $urls = 0
    foreach ($document in @($Items)) {
        $signals = Get-DocumentSignals $document
        if ($signals.Statement) { $statement++ }
        if ($signals.WebsiteFile) { $websiteFiles++ }
        if ($signals.FileId) { $fileIds++ }
        if ($signals.Url) { $urls++ }
        $date = Get-DocumentDate $document
        if ($null -ne $date) { $dates.Add($date) }
    }
    $firstMonth = ''
    $lastMonth = ''
    if ($dates.Count -gt 0) {
        $ordered = @($dates | Sort-Object)
        $firstMonth = $ordered[0].ToString('yyyy-MM')
        $lastMonth = $ordered[-1].ToString('yyyy-MM')
    }
    [pscustomobject]@{
        Count = @($Items).Count
        StatementCount = $statement
        WebsiteFileCount = $websiteFiles
        FileIdCount = $fileIds
        UrlCount = $urls
        FirstMonth = $firstMonth
        LastMonth = $lastMonth
    }
}

function Write-HistoryReport {
    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add('# Powens Sandbox - profondeur transactionnelle et relevés')
    $lines.Add('')
    $lines.Add('- Référence des routes : `C:\Users\djabi\bibliotheque\docs\core\POWENS.md` uniquement')
    $lines.Add('- Sandbox uniquement ; les noms de banque et libellés de comptes retournés sont conservés pour clarifier ce rapport local, mais aucun token, secret, identifiant technique, montant ou transaction brute n''est enregistré.')
    $lines.Add('- Le POST éventuel est limité à `/auth/renew` pour obtenir un token en mémoire ; aucune donnée bancaire n''est modifiée.')
    $lines.Add('')
    $lines.Add('## Résumé')
    $lines.Add('')
    $pass = @($observations | Where-Object Result -eq 'PASS').Count
    $blocked = @($observations | Where-Object Result -eq 'BLOCKED').Count
    $fail = @($observations | Where-Object Result -eq 'FAIL').Count
    $lines.Add("- Routes PASS: $pass")
    $lines.Add("- Routes BLOCKED: $blocked")
    $lines.Add("- Routes FAIL: $fail")
    if ($null -ne $fatalError) { $lines.Add('- Blocage final: configuration ou exécution interrompue.') }
    $lines.Add('')
    $lines.Add('## Routes exécutées')
    $lines.Add('')
    $lines.Add('| Domaine | Méthode | Route | Token | Paramètres | HTTP | JSON | Résultat | Note |')
    $lines.Add('|---|---|---|---|---|---:|---|---|---|')
    foreach ($observation in $observations) {
        $note = "$($observation.Note)".Replace('|', '\|')
        $lines.Add("| $($observation.Area) | $($observation.Method) | ``$($observation.Path)`` | $($observation.TokenRequired) | $($observation.RequiredParameters) | $($observation.Status) | $($observation.Structure) | $($observation.Result) | $note |")
    }
    $lines.Add('')
    $lines.Add('## Diagnostic des connexions')
    $lines.Add('')
    $lines.Add('- Les dates sont réduites au mois ; les identifiants techniques et messages bancaires bruts ne sont pas conservés.')
    $lines.Add('- `SUCCESS_NULL` signifie que Powens renvoie `state=null`, ce que sa documentation définit comme une synchronisation réussie ; `NOT_REPORTED` signifie que le champ existe mais vaut `null`.')
    $lines.Add('| Connexion / banque | months_to_fetch connector | État | Erreur | Créée | Dernière mise à jour | Dernier push | Logs lus |')
    $lines.Add('|---|---:|---|---|---|---|---|---:|')
    foreach ($result in $connectionDiagnostics) {
        $lines.Add("| $($result.Connection) | $($result.ConnectorMonthsToFetch) | $($result.State) | $($result.Error) | $($result.Created) | $($result.LastUpdate) | $($result.LastPush) | $($result.Logs) |")
    }
    if ($connectionDiagnostics.Count -eq 0) { $lines.Add('| aucune |  | NO_DATA | NO_DATA |  |  |  | 0 |') }
    $lines.Add('')
    $lines.Add('## Synthèse par connexion')
    $lines.Add('')
    $lines.Add('- La connexion/banque et le nom de compte sont affichés lorsqu''ils sont présents dans les réponses Powens ; sinon le probe conserve un libellé générique.')
    $lines.Add('- `USER_AGGREGATE` est la vue de tous les comptes et ne constitue pas une quatrième connexion.')
    $lines.Add('- `YES` dans la colonne « au moins un » ne signifie pas que tous les comptes de la connexion ont cette profondeur.')
    $lines.Add('- `usage` est affiché lorsqu''il est renvoyé par Powens ; les catégories de produit comme compte courant ou Livret A ne sont pas inventées.')
    $lines.Add('- Le détail de connexion, les logs de synchronisation et le détail de chaque compte sont lus sans modifier ni resynchroniser les données.')
    $lines.Add('')
    $lines.Add('| Connexion / banque | months_to_fetch connector | Comptes | Mois minimum | Mois maximum | Comptes >=12 mois | Au moins un >=12 | Tous >=12 | Comptes >=24 mois |')
    $lines.Add('|---|---:|---:|---:|---:|---:|---|---|---:|')
    foreach ($result in $connectionDepthResults) {
        $lines.Add("| $($result.Connection) | $($result.ConnectorMonthsToFetch) | $($result.Accounts) | $($result.MinMonths) | $($result.MaxMonths) | $($result.AccountsAtLeast12) | $($result.AtLeast12) | $($result.AllAccountsAtLeast12) | $($result.AccountsAtLeast24) |")
    }
    if ($connectionDepthResults.Count -eq 0) { $lines.Add('| aucune |  | 0 |  |  | 0 | NO_DATA | NO_DATA | 0 |') }
    $lines.Add('')
    $lines.Add('## Profondeur transactionnelle observée')
    $lines.Add('')
    $lines.Add('- Les mois sont calculés localement à partir des dates reçues ; les dates exactes, libellés, montants et identifiants ne sont pas conservés.')
    $lines.Add('- `YES` signifie une amplitude calendaire inclusive d''au moins 24 mois, pas une garantie d''exhaustivité bancaire.')
    $lines.Add('')
    $lines.Add('| Compte | Connexion / banque | Nom du compte | Type API | Usage Powens | Ouverture API | Dernière mise à jour | Transactions | Dates interprétées | Premier mois | Dernier mois | Mois couverts | >=24 mois |')
    $lines.Add('|---|---|---|---|---|---|---|---:|---:|---|---|---:|---|')
    foreach ($result in $depthResults) {
        $lines.Add("| $($result.Account) | $($result.Connection) | $($result.AccountName) | $($result.AccountType) | $($result.AccountUsage) | $($result.AccountOpeningMonth) | $($result.AccountLastUpdateMonth) | $($result.Count) | $($result.Parsed) | $($result.FirstMonth) | $($result.LastMonth) | $($result.Months) | $($result.AtLeast24) |")
    }
    if ($depthResults.Count -eq 0) { $lines.Add('| aucune | aucune |  |  |  |  |  | 0 | 0 |  |  |  | NOT RUN |') }
    $lines.Add('')
    $lines.Add('## Relevés et documents fournisseur')
    $lines.Add('')
    $lines.Add('- Cette section ne télécharge aucun fichier. Elle vérifie seulement les documents retournés et les indicateurs de fichier/lien présents dans les réponses.')
    $lines.Add('')
    $lines.Add('| Route | Documents | Type statement détecté | Indicateur fichier site | ID fichier | URL/lien | Premier mois | Dernier mois |')
    $lines.Add('|---|---:|---:|---:|---:|---:|---|---|')
    foreach ($result in $documentResults) {
        $lines.Add("| $($result.Route) | $($result.Count) | $($result.StatementCount) | $($result.WebsiteFileCount) | $($result.FileIdCount) | $($result.UrlCount) | $($result.FirstMonth) | $($result.LastMonth) |")
    }
    if ($documentResults.Count -eq 0) { $lines.Add('| aucune | 0 | 0 | 0 | 0 | 0 |  |  |') }
    $lines.Add('')
    $lines.Add('## Limites')
    $lines.Add('')
    $lines.Add('- Une collection vide ne prouve pas que la banque ne possède aucun historique ; elle prouve seulement que Powens n''a rien retourné dans ce contexte Sandbox.')
    $lines.Add('- L''absence d''un indicateur fichier ne prouve pas l''absence d''un PDF si le fournisseur expose uniquement un espace bancaire en ligne.')
    $lines.Add('- Aucun téléchargement de relevé n''est effectué automatiquement.')
    $lines.Add('')
    $lines.Add('## Blocages précis')
    $lines.Add('')
    if ($blocked -eq 0 -and $fail -eq 0) {
        $lines.Add('- Aucun blocage HTTP ni échec client sur les routes exécutées.')
    } else {
        $lines.Add("- Routes bloquées: $blocked ; routes en échec: $fail.")
    }
    $unknownConnectionMetadata = @($connectionDiagnostics | Where-Object {
        $_.State -eq 'UNKNOWN' -or $_.Created -eq 'UNKNOWN' -or $_.LastUpdate -eq 'UNKNOWN' -or $_.LastPush -eq 'UNKNOWN'
    }).Count
    if ($unknownConnectionMetadata -gt 0) {
        $lines.Add('- Les détails de connexion ont répondu, mais certaines métadonnées d''état ou de date sont absentes (`UNKNOWN`) ; elles ne permettent pas de conclure sur la santé de la connexion ni sur l''âge du compte.')
    }
    $unknownAccountOpening = @($depthResults | Where-Object { $_.AccountOpeningMonth -in @('UNKNOWN', 'NOT_REPORTED') }).Count
    if ($unknownAccountOpening -gt 0) {
        $lines.Add('- La date d''ouverture API est absente pour au moins un compte ; une profondeur observée de quelques mois ne peut donc pas être attribuée automatiquement à une création récente du compte.')
    }
    $lines.Add('- `months_to_fetch` est reporté comme indice de configuration du connector uniquement ; il n''est pas interprété comme une borne, car la preuve retenue est l''amplitude des transactions réellement retournées.')
    if (@($documentResults | Where-Object { $_.Count -eq 0 }).Count -gt 0) {
        $lines.Add('- La route Documents a répondu sans document ; cela bloque seulement la preuve d''un relevé statement ou d''un fichier/lien dans ce contexte Sandbox, pas l''existence de tels éléments chez la banque.')
    }
    $lines.Add('')
    $lines.Add('## Commande de relance')
    $lines.Add('')
    $lines.Add('```powershell')
    $lines.Add('& .\tools\powens-sandbox\powens-history-depth.ps1')
    $lines.Add('```')
    $lines | Set-Content -LiteralPath $reportPath -Encoding UTF8
}

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
        throw 'POWENS_BASE_URL doit être une URL HTTPS Sandbox en /2.0, sans identifiant ni query.'
    }
    $baseUri = $parsedBase.AbsoluteUri.TrimEnd('/')
    Add-Type -AssemblyName System.Net.Http
    $http = [System.Net.Http.HttpClient]::new()
    $http.Timeout = [TimeSpan]::FromSeconds(30)

    if (-not [string]::IsNullOrWhiteSpace($existingToken)) {
        $userToken = $existingToken
        Write-Host 'TOKEN user-access-token fourni par variable d''environnement; valeur non affichée.'
    } else {
        $renewBody = @{
            grant_type = 'client_credentials'
            client_id = Get-EnvValue 'POWENS_CLIENT_ID'
            client_secret = Get-EnvValue 'POWENS_CLIENT_SECRET'
            id_user = $userId
            revoke_previous = $false
        } | ConvertTo-Json
        $renew = Invoke-PowensApi -Method POST -Path 'auth/renew' -Body $renewBody
        Add-Observation 'auth' POST 'POST /auth/renew' 'client_id + client_secret' 'grant_type; id_user; revoke_previous=false' $renew 'Émission d''un token en mémoire uniquement; aucune donnée bancaire modifiée.'
        if ($renew.Status -lt 200 -or $renew.Status -ge 300) { throw 'auth/renew indisponible.' }
        $userToken = Get-FirstProperty $renew.Json @('access_token', 'token')
        if ([string]::IsNullOrWhiteSpace("$userToken")) { throw 'Token utilisateur absent de la réponse auth/renew.' }
    }

    $userRoute = "users/$userId"
    $connections = Invoke-PowensCollection 'connections' "$userRoute/connections" 'GET /users/{userId}/connections' 'Authorization: Bearer <user-access-token>' 'userId' 'connections' $userToken
    $connectionById = @{}
    $connectionMetadataById = @{}
    $connectionIndex = 0
    foreach ($connection in @($connections.Items)) {
        $connectionIndex++
        $connectionId = Get-FirstProperty $connection @('id', 'id_connection')
        $connectionLabel = Get-ConnectionLabel $connection $connectionIndex
        $connectorMonthsToFetch = 'UNKNOWN'
        $connector = Get-JsonProperty $connection 'connector'
        $connectorRef = Get-FirstProperty $connector @('uuid', 'id')
        if ($null -eq $connectorRef) { $connectorRef = Get-FirstProperty $connection @('id_connector', 'connector_id', 'connectorUuid', 'connector_uuid') }
        if ($connectionLabel -like 'CONNECTION_*' -and $null -ne $connectorRef -and "$connectorRef" -match '^[A-Za-z0-9_-]+$') {
            $connectorResponse = Invoke-PowensApi -Method GET -Path "connectors/$connectorRef"
            Add-Observation 'connectors' GET 'GET /connectors/{connectorUuid}' 'none' 'connectorUuid' $connectorResponse 'Nom du connector inspecté; aucun identifiant technique conservé.'
            if ($connectorResponse.Status -ge 200 -and $connectorResponse.Status -lt 300) {
                $connectionLabel = Get-ConnectionLabel $connection $connectionIndex $connectorResponse.Json
                $connectorMonthsToFetch = Get-ReportText (Get-JsonProperty $connectorResponse.Json 'months_to_fetch')
            }
        }
        if ($null -ne $connectionId) {
            $connectionDetail = Invoke-PowensApi -Method GET -Path "$userRoute/connections/$connectionId" -Token $userToken
            Add-Observation 'connection-details' GET 'GET /users/{userId}/connections/{connectionId}' 'Authorization: Bearer <user-access-token>' 'userId; connectionId' $connectionDetail 'État et métadonnées de synchronisation inspectés; identifiant technique non conservé.'
            $connectionLogs = Invoke-PowensCollection 'connection-logs' "$userRoute/connections/$connectionId/logs?limit=100" 'GET /users/{userId}/connections/{connectionId}/logs?limit=100' 'Authorization: Bearer <user-access-token>' 'userId; connectionId; limit facultatif' 'connectionlogs' $userToken
            $connectionPayload = if ($connectionDetail.Status -ge 200 -and $connectionDetail.Status -lt 300) { $connectionDetail.Json } else { $null }
            $stateProperty = if ($null -ne $connectionPayload) { $connectionPayload.PSObject.Properties['state'] } else { $null }
            $connectionState = if ($null -eq $connectionPayload -or $null -eq $stateProperty) { 'UNKNOWN' }
                elseif ($null -eq $stateProperty.Value) { 'SUCCESS_NULL' }
                else { Get-ReportText $stateProperty.Value }
            if ([string]::IsNullOrWhiteSpace($connectionState)) { $connectionState = 'UNKNOWN' }
            $errorProperty = if ($null -ne $connectionPayload) { $connectionPayload.PSObject.Properties['error'] } else { $null }
            $connectionError = if ($null -eq $connectionPayload -or $null -eq $errorProperty) { 'UNKNOWN' }
                elseif ($null -eq $errorProperty.Value) { 'NONE' }
                else { Get-ReportText $errorProperty.Value }
            if ([string]::IsNullOrWhiteSpace($connectionError)) { $connectionError = 'NONE' }
            $connectionDiagnostics.Add([pscustomobject]@{
                Connection = $connectionLabel
                ConnectorMonthsToFetch = $connectorMonthsToFetch
                State = $connectionState
                Error = $connectionError
                Created = Get-ReportMonthStatus $connectionPayload 'created'
                LastUpdate = Get-ReportMonthStatus $connectionPayload 'last_update'
                LastPush = Get-ReportMonthStatus $connectionPayload 'last_push'
                Logs = @($connectionLogs.Items).Count
            })
            $connectionById["$connectionId"] = $connectionLabel
            $connectionMetadataById["$connectionId"] = [pscustomobject]@{
                Label = $connectionLabel
                ConnectorMonthsToFetch = $connectorMonthsToFetch
                DetailStatus = if ($null -ne $connectionDetail.Status) { $connectionDetail.Status } else { 'client error' }
                LogsPages = $connectionLogs.Pages
            }
        }
    }

    $accounts = Invoke-PowensCollection 'accounts' "$userRoute/accounts" 'GET /users/{userId}/accounts' 'Authorization: Bearer <user-access-token>' 'userId; all facultatif' 'accounts' $userToken
    $accountIndex = 0
    foreach ($account in @($accounts.Items)) {
        $accountIndex++
        $accountId = Get-FirstProperty $account @('id', 'id_account')
        if ($null -eq $accountId) { continue }
        $connectionId = Get-FirstProperty $account @('id_connection', 'connection_id')
        $connectionInfo = if ($null -ne $connectionId -and $connectionMetadataById.ContainsKey("$connectionId")) { $connectionMetadataById["$connectionId"] } else { $null }
        $connectionLabel = if ($null -ne $connectionInfo) { $connectionInfo.Label } elseif ($null -ne $connectionId -and $connectionById.ContainsKey("$connectionId")) { $connectionById["$connectionId"] } else { 'CONNECTION_UNKNOWN' }
        $connectorMonthsToFetch = if ($null -ne $connectionInfo) { $connectionInfo.ConnectorMonthsToFetch } else { 'UNKNOWN' }
        $displayAccount = "ACCOUNT_$('{0:D2}' -f $accountIndex)"
        $accountDetail = Invoke-PowensApi -Method GET -Path "$userRoute/accounts/$accountId" -Token $userToken
        Add-Observation 'account-details' GET 'GET /users/{userId}/accounts/{accountId}' 'Authorization: Bearer <user-access-token>' 'userId; accountId' $accountDetail 'Métadonnées du compte inspectées; identifiant technique non conservé.'
        $accountPayload = if ($accountDetail.Status -ge 200 -and $accountDetail.Status -lt 300) { $accountDetail.Json } else { $account }
        $accountName = Get-ReportText (Get-JsonProperty $accountPayload 'name')
        if ([string]::IsNullOrWhiteSpace($accountName)) { $accountName = 'UNKNOWN' }
        $accountUsage = Get-ReportText (Get-JsonProperty $accountPayload 'usage')
        if ([string]::IsNullOrWhiteSpace($accountUsage)) { $accountUsage = 'UNKNOWN' }
        $accountType = Get-ReportText (Get-JsonProperty $accountPayload 'type')
        if ([string]::IsNullOrWhiteSpace($accountType)) { $accountType = 'UNKNOWN' }
        $accountOpeningMonth = Get-ReportMonthStatus $accountPayload 'opening_date'
        $accountLastUpdateMonth = Get-ReportMonthStatus $accountPayload 'last_update'
        $transactionPath = "$userRoute/accounts/$accountId/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01"
        $transactions = Invoke-PowensCollection 'transactions' $transactionPath 'GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01' 'Authorization: Bearer <user-access-token>' 'userId; accountId; limit obligatoire; min_date/max_date facultatifs' 'transactions' $userToken
        $span = Get-MonthSpan $transactions.Items { param($item) Get-TransactionDate $item }
        $depthResults.Add([pscustomobject]@{
            Account = $displayAccount
            Connection = $connectionLabel
            AccountName = $accountName
            AccountUsage = $accountUsage
            AccountType = $accountType
            AccountOpeningMonth = $accountOpeningMonth
            AccountLastUpdateMonth = $accountLastUpdateMonth
            ConnectorMonthsToFetch = $connectorMonthsToFetch
            Count = $span.Count
            Parsed = $span.Parsed
            FirstMonth = $span.FirstMonth
            LastMonth = $span.LastMonth
            Months = if ($null -eq $span.Months) { '' } else { $span.Months }
            AtLeast24 = $span.AtLeast24
        })
        Write-Host ("HISTORY {0} connection={1} months={2} >=24={3}" -f $displayAccount, $connectionLabel, $span.Months, $span.AtLeast24)
    }

    $aggregatePath = "$userRoute/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01"
    $aggregate = Invoke-PowensCollection 'transactions' $aggregatePath 'GET /users/{userId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01' 'Authorization: Bearer <user-access-token>' 'userId; limit obligatoire; min_date/max_date facultatifs' 'transactions' $userToken
    $aggregateSpan = Get-MonthSpan $aggregate.Items { param($item) Get-TransactionDate $item }
    $depthResults.Add([pscustomobject]@{
        Account = 'USER_AGGREGATE'
        Connection = 'ALL_CONNECTIONS'
        AccountName = 'ALL_ACCOUNTS'
        AccountUsage = 'N/A'
        AccountType = 'N/A'
        AccountOpeningMonth = 'N/A'
        AccountLastUpdateMonth = 'N/A'
        Count = $aggregateSpan.Count
        Parsed = $aggregateSpan.Parsed
        FirstMonth = $aggregateSpan.FirstMonth
        LastMonth = $aggregateSpan.LastMonth
        Months = if ($null -eq $aggregateSpan.Months) { '' } else { $aggregateSpan.Months }
        AtLeast24 = $aggregateSpan.AtLeast24
    })

    foreach ($group in @($depthResults | Where-Object { "$($_.Account)" -like 'ACCOUNT_*' } | Group-Object Connection | Sort-Object Name)) {
        $spans = @($group.Group | Where-Object { "$($_.Months)" -ne '' } | ForEach-Object { [int]$_.Months })
        $atLeast12 = @($spans | Where-Object { $_ -ge 12 }).Count
        $atLeast24 = @($spans | Where-Object { $_ -ge 24 }).Count
        $connectorMonthsToFetch = Get-ReportText (($group.Group | Select-Object -First 1).ConnectorMonthsToFetch)
        $connectionDepthResults.Add([pscustomobject]@{
            Connection = $group.Name
            Accounts = $group.Count
            ConnectorMonthsToFetch = $connectorMonthsToFetch
            MinMonths = if ($spans.Count -gt 0) { ($spans | Measure-Object -Minimum).Minimum } else { '' }
            MaxMonths = if ($spans.Count -gt 0) { ($spans | Measure-Object -Maximum).Maximum } else { '' }
            AccountsAtLeast12 = $atLeast12
            AtLeast12 = if ($spans.Count -eq 0) { 'NO_DATA' } elseif ($atLeast12 -gt 0) { 'YES' } else { 'NO' }
            AllAccountsAtLeast12 = if ($spans.Count -eq 0) { 'NO_DATA' } elseif ($atLeast12 -eq $spans.Count) { 'YES' } else { 'NO' }
            AccountsAtLeast24 = $atLeast24
        })
    }

    $subscriptions = Invoke-PowensCollection 'subscriptions' "$userRoute/subscriptions?all" 'GET /users/{userId}/subscriptions?all' 'Authorization: Bearer <user-access-token>' 'userId; all facultatif' 'subscriptions' $userToken
    $documents = Invoke-PowensCollection 'documents' "$userRoute/documents?limit=1000" 'GET /users/{userId}/documents?limit=1000' 'Authorization: Bearer <user-access-token>' 'userId; limit obligatoire (maximum 1000)' 'documents' $userToken
    $documentSummary = Get-DocumentSummary $documents.Items
    $documentResults.Add([pscustomobject]@{
        Route = 'GET /users/{userId}/documents'
        Count = $documentSummary.Count
        StatementCount = $documentSummary.StatementCount
        WebsiteFileCount = $documentSummary.WebsiteFileCount
        FileIdCount = $documentSummary.FileIdCount
        UrlCount = $documentSummary.UrlCount
        FirstMonth = $documentSummary.FirstMonth
        LastMonth = $documentSummary.LastMonth
    })
    Write-Host ("DOCUMENTS count={0} statements={1} website_files={2} file_ids={3} urls={4}" -f `
        $documentSummary.Count, $documentSummary.StatementCount, $documentSummary.WebsiteFileCount,
        $documentSummary.FileIdCount, $documentSummary.UrlCount)

    $detailCount = 0
    foreach ($document in @($documents.Items)) {
        if ($detailCount -ge 5) { break }
        $documentId = Get-FirstProperty $document @('id', 'id_document')
        if ($null -eq $documentId) { continue }
        $detailCount++
        $detail = Invoke-PowensApi -Method GET -Path "documents/$documentId" -Token $userToken
        Add-Observation 'documents' GET 'GET /documents/{documentId}' 'Authorization: Bearer <user-access-token>' 'documentId' $detail 'Métadonnées et liens inspectés; aucun fichier téléchargé.'
    }
} catch {
    $fatalError = $_.Exception.Message
    Write-Host "FAIL execution: $fatalError"
} finally {
    if ($null -ne $http) { $http.Dispose() }
    if ($null -ne $baseUri) { Write-HistoryReport }
}

$failCount = @($observations | Where-Object Result -eq 'FAIL').Count
Write-Host "Report=$reportPath"
if ($null -ne $fatalError -or $failCount -gt 0) { exit 1 }
exit 0
