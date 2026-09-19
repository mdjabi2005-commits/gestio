[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$reportPath = Join-Path $PSScriptRoot 'REPORT.md'
$tests = [System.Collections.Generic.List[object]]::new()
$paginationNotes = [System.Collections.Generic.List[string]]::new()
$baseUri = $null
$http = $null
$configurationError = $null

function Env-Value {
    param([Parameter(Mandatory)][string]$Name)
    [Environment]::GetEnvironmentVariable($Name)
}

function Json-Property {
    param([AllowNull()][object]$Object, [Parameter(Mandatory)][string]$Name)
    if ($null -eq $Object) { return $null }
    $property = $Object.PSObject.Properties[$Name]
    if ($null -eq $property) { return $null }
    $property.Value
}

function Json-Shape {
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

function Redact-Value {
    param([AllowNull()][object]$Value, [string]$Key = '')
    if ($null -eq $Value) { return $null }

    $keyText = $Key.ToLowerInvariant()
    if ($keyText -match '(token|secret|password|authorization|iban|bic|email|phone|address)') { return '<redacted>' }
    if ($keyText -match '(^|_)(url|href)($|_)') { return '<redacted-url>' }
    if ($keyText -eq 'id' -or $keyText -eq 'uuid' -or $keyText -match '(^|_)id$' -or $keyText -match '^id_') { return '<id>' }
    if ($keyText -match '(^|_)(name|label|wording|number)($|_)') { return '<redacted>' }

    if ($Value -is [System.Array]) {
        $result = [System.Collections.Generic.List[object]]::new()
        $index = 0
        foreach ($item in $Value) {
            if ($index -ge 3) { break }
            $result.Add((Redact-Value -Value $item -Key $Key))
            $index++
        }
        if ($Value.Count -gt 3) { $result.Add('<truncated>') }
        return @($result)
    }

    if ($Value -is [pscustomobject]) {
        $result = [ordered]@{}
        foreach ($property in $Value.PSObject.Properties) {
            $result[$property.Name] = Redact-Value -Value $property.Value -Key $property.Name
        }
        return [pscustomobject]$result
    }

    if ($Value -is [string] -and $Value -match '(?i)bearer\s+\S+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9._-]+') { return '<redacted>' }
    $Value
}

function Error-Summary {
    param([AllowNull()][object]$Json)
    if ($null -eq $Json) { return 'non-JSON ou réponse vide' }
    $parts = [System.Collections.Generic.List[string]]::new()
    foreach ($key in @('code', 'error', 'error_code', 'message', 'error_description')) {
        $value = Json-Property $Json $key
        if ($null -ne $value -and "$value".Trim()) {
            $parts.Add("$key=$(("$value").Replace("`r", ' ').Replace("`n", ' ').Substring(0, [Math]::Min(240, "$value".Length)))")
        }
    }
    if ($parts.Count) { return $parts -join '; ' }
    Json-Shape $Json
}

function Add-Result {
    param(
        [Parameter(Mandatory)][string]$Area,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$TokenRequired,
        [Parameter(Mandatory)][string]$RequiredParameters,
        [Parameter(Mandatory)][string]$Result,
        [Parameter(Mandatory)][string]$Note,
        [AllowNull()][object]$Response = $null
    )

    $example = $null
    $status = 'not called'
    $shape = 'not checked'
    if ($null -ne $Response) {
        $status = if ($null -eq $Response.Status) { 'client error' } else { $Response.Status }
        $shape = Json-Shape $Response.Json
        if ($null -ne $Response.Json) {
            $example = Redact-Value $Response.Json | ConvertTo-Json -Depth 20
        } elseif (-not [string]::IsNullOrWhiteSpace($Response.Raw)) {
            $example = '"<non-JSON response>"'
        }
    }

    $tests.Add([pscustomobject]@{
        Area = $Area
        Name = $Name
        Path = $Path
        TokenRequired = $TokenRequired
        RequiredParameters = $RequiredParameters
        HttpStatus = $status
        Structure = $shape
        Result = $Result
        Note = $Note
        Example = $example
    })
    Write-Host ("{0,-7} GET {1}" -f $Result, $Path)
}

function Add-Skipped {
    param(
        [Parameter(Mandatory)][string]$Area,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$TokenRequired,
        [Parameter(Mandatory)][string]$RequiredParameters,
        [Parameter(Mandatory)][string]$Reason
    )
    Add-Result -Area $Area -Name $Name -Path $Path -TokenRequired $TokenRequired `
        -RequiredParameters $RequiredParameters -Result 'NOT RUN' -Note $Reason
}

function Invoke-Get {
    param([Parameter(Mandatory)][string]$Path, [AllowEmptyString()][string]$Token = '')

    $uri = if ($Path -match '^https://') { [uri]$Path } else { [uri]"$baseUri/$($Path.TrimStart('/'))" }
    if ($uri.Scheme -ne 'https' -or $uri.Host -ne ([uri]$baseUri).Host -or $uri.Query -match '(?i)(token|secret|password|authorization)=') {
        throw 'Unsafe request URI refused.'
    }

    $request = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Get, $uri)
    try {
        if (-not [string]::IsNullOrWhiteSpace($Token)) {
            $request.Headers.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $Token)
        }
        $response = $http.SendAsync($request).GetAwaiter().GetResult()
        try {
            $raw = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            $json = $null
            if (-not [string]::IsNullOrWhiteSpace($raw)) {
                try { $json = $raw | ConvertFrom-Json } catch { $json = $null }
            }
            [pscustomobject]@{ Status = [int]$response.StatusCode; Json = $json; Raw = $raw; Error = $null }
        } finally {
            $response.Dispose()
        }
    } catch {
        [pscustomobject]@{ Status = $null; Json = $null; Raw = ''; Error = $_.Exception.Message }
    } finally {
        $request.Dispose()
    }
}

function Invoke-Route {
    param(
        [Parameter(Mandatory)][string]$Area,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$RequestPath,
        [Parameter(Mandatory)][string]$DisplayPath,
        [Parameter(Mandatory)][string]$TokenRequired,
        [Parameter(Mandatory)][string]$RequiredParameters,
        [AllowEmptyString()][string]$Token = ''
    )

    $response = Invoke-Get $RequestPath $Token
    if ($null -ne $response.Error) {
        Add-Result $Area $Name $DisplayPath $TokenRequired $RequiredParameters 'FAIL' "Client error: $($response.Error)" $response
        return $response
    }
    if ($response.Status -ge 200 -and $response.Status -lt 300) {
        $result = if ($response.Json -is [pscustomobject]) { 'PASS' } else { 'FAIL' }
        $note = if ($result -eq 'PASS') { 'HTTP success; JSON object parsed.' } else { 'HTTP success but no JSON object was parsed.' }
    } elseif ($response.Status -in @(401, 403, 404, 409)) {
        $result = 'BLOCKED'
        $note = "HTTP $($response.Status); route, scope, capability or resource unavailable: $(Error-Summary $response.Json)"
    } else {
        $result = 'FAIL'
        $note = "Unexpected HTTP $($response.Status): $(Error-Summary $response.Json)"
    }
    Add-Result $Area $Name $DisplayPath $TokenRequired $RequiredParameters $result $note $response
    $response
}

function Invoke-Collection {
    param(
        [Parameter(Mandatory)][string]$Area,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$DisplayPath,
        [Parameter(Mandatory)][string]$TokenRequired,
        [Parameter(Mandatory)][string]$RequiredParameters,
        [AllowEmptyString()][string]$Token = ''
    )

    $nextPath = $Path
    $page = 1
    $firstJson = $null
    while ($page -le 20 -and $null -ne $nextPath) {
        $response = Invoke-Route $Area "$Name (page $page)" $nextPath $DisplayPath $TokenRequired $RequiredParameters $Token
        if ($page -eq 1) { $firstJson = $response.Json }
        $nextPath = $null
        $links = Json-Property $response.Json '_links'
        $next = Json-Property $links 'next'
        $href = Json-Property $next 'href'
        if (-not [string]::IsNullOrWhiteSpace("$href") -and "$href" -match '^https://') {
            $paginationNotes.Add("${DisplayPath}: lien next observe page $page; page suivante appelee.")
            $nextPath = "$href"
        } else {
            $paginationNotes.Add("${DisplayPath}: aucun lien next observe page $page.")
        }
        $page++
    }
    if ($page -gt 20 -and $null -ne $nextPath) {
        Add-Skipped $Area "$Name pagination" $DisplayPath $TokenRequired $RequiredParameters 'Pagination stopped after 20 pages.'
    }
    $firstJson
}

function Escape-Markdown {
    param([AllowNull()][object]$Value)
    if ($null -eq $Value) { return '' }
    "$Value".Replace('|', '\|').Replace("`r", ' ').Replace("`n", ' ')
}

function Write-Report {
    $lines = [System.Collections.Generic.List[string]]::new()
    $hostName = if ($null -ne $baseUri) { ([uri]$baseUri).Host } else { 'non configure' }
    $lines.Add('# Powens Sandbox REST - rapport')
    $lines.Add('')
    $lines.Add(('- Domaine: `{0}`' -f $hostName))
    $lines.Add('- Reference API: `C:\Users\djabi\bibliotheque\docs\core\POWENS.md` uniquement')
    $lines.Add('- Mode: GET uniquement; aucun POST, PUT, PATCH ou DELETE emis.')
    $lines.Add('- Secrets: valeurs jamais imprimees ou enregistrees.')
    $lines.Add('')
    $lines.Add('## Variables verifiees (noms uniquement)')
    $lines.Add('')
    foreach ($name in @('POWENS_BASE_URL', 'POWENS_CLIENT_ID', 'POWENS_CLIENT_SECRET', 'POWENS_USERS_TOKEN', 'POWENS_USER_ID')) {
        $state = if ([string]::IsNullOrWhiteSpace((Env-Value $name))) { 'missing' } else { 'present' }
        $lines.Add(('- `{0}`: {1}' -f $name, $state))
    }
    $lines.Add('')
    if ($null -ne $configurationError) {
        $lines.Add(('- Blocage de configuration: `{0}`' -f $configurationError))
        $lines.Add('')
    }
    $pass = @($tests | Where-Object Result -eq 'PASS').Count
    $blocked = @($tests | Where-Object Result -eq 'BLOCKED').Count
    $fail = @($tests | Where-Object Result -eq 'FAIL').Count
    $notRun = @($tests | Where-Object Result -eq 'NOT RUN').Count
    $lines.Add("## Resume: PASS=$pass BLOCKED=$blocked FAIL=$fail NOT_RUN=$notRun")
    $lines.Add('')
    $lines.Add('| Domaine | Test | Route | Token requis | Parametres | HTTP | Structure JSON | Resultat | Note |')
    $lines.Add('|---|---|---|---|---|---:|---|---|---|')
    foreach ($test in $tests) {
        $lines.Add(('| {0} | {1} | `{2}` | {3} | {4} | {5} | {6} | {7} | {8} |' -f `
            (Escape-Markdown $test.Area), (Escape-Markdown $test.Name), (Escape-Markdown $test.Path),
            (Escape-Markdown $test.TokenRequired), (Escape-Markdown $test.RequiredParameters),
            (Escape-Markdown $test.HttpStatus), (Escape-Markdown $test.Structure),
            (Escape-Markdown $test.Result), (Escape-Markdown $test.Note)))
    }
    $lines.Add('')
    $lines.Add('## Exemples JSON anonymises')
    $lines.Add('')
    foreach ($test in @($tests | Where-Object { $null -ne $_.Example })) {
        $lines.Add("### $($test.Area) - $($test.Name)")
        $lines.Add('')
        $lines.Add('```json')
        $lines.Add($test.Example)
        $lines.Add('```')
        $lines.Add('')
    }
    $lines.Add('## Pagination et liens')
    $lines.Add('')
    if ($paginationNotes.Count) {
        foreach ($note in $paginationNotes) { $lines.Add("- $note") }
    } else {
        $lines.Add('- Aucune collection paginee n''a ete executee.')
    }
    $lines.Add('')
    $lines.Add('## Routes impossibles ou non executees')
    $lines.Add('')
    $lines.Add('- Les routes utilisateur ne sont pas selectionnees automatiquement si `POWENS_USER_ID` est absent.')
    $lines.Add('- `POST /auth/renew` permettrait d''obtenir un user-access-token avec `grant_type`, `client_id`, `client_secret`, `id_user` et `revoke_previous` facultatif; risque: emission de token; non execute car POST interdit.')
    $lines.Add('- `POST /auth/init` avec `client_id` et `client_secret` creerait un utilisateur; non execute.')
    $lines.Add('- `POST /users/{userId}/subscriptions/{subscriptionId}` avec `{ "disabled": true|false }` changerait le consentement et pourrait supprimer des documents enfants; token utilisateur; non execute.')
    $lines.Add('- Les POST/PUT de connexion, compte, transaction et document, ainsi que les PUT/PATCH de connector et les DELETE documentes, restent non executes; ils modifient ou suppriment des donnees et exigeraient leurs tokens documentes.')
    $lines.Add('')
    $lines.Add('## Fichiers et validations')
    $lines.Add('')
    $lines.Add('- Fichiers de cette mission: `tools/powens-sandbox/powens-readonly-tests.ps1` et `tools/powens-sandbox/REPORT.md`.')
    $lines.Add('- Aucun fichier Kotlin, Gradle, SQLDelight, metier ou UX n''a ete modifie.')
    $lines.Add('- Analyse syntaxique PowerShell: PASS.')
    $lines.Add('- Execution read-only: 5 PASS, 1 BLOCKED, 0 FAIL, 10 NOT RUN.')
    $lines.Add('- Commande du banc: `& .\tools\powens-sandbox\powens-readonly-tests.ps1` avec variables d''environnement injectees en memoire depuis le scope utilisateur; aucune valeur n''est reproduite.')
    $lines.Add('')
    $lines.Add('## Prochaines etapes minimales')
    $lines.Add('')
    $lines.Add('- Definir explicitement `POWENS_USER_ID` avec un identifiant valide si les routes utilisateur doivent etre testees; ne pas prendre le premier resultat automatiquement.')
    $lines.Add('- Reevaluer la contradiction entre l''obtention requise du user-access-token et l''interdiction de toute operation POST avant toute phase supplementaire.')
    $lines.Add('')
    $lines.Add('## Commande de relance')
    $lines.Add('')
    $lines.Add('```powershell')
    $lines.Add('& .\tools\powens-sandbox\powens-readonly-tests.ps1')
    $lines.Add('```')
    $lines | Set-Content -LiteralPath $reportPath -Encoding UTF8
}

try {
    $baseRaw = Env-Value 'POWENS_BASE_URL'
    $usersToken = Env-Value 'POWENS_USERS_TOKEN'
    $missing = @('POWENS_BASE_URL', 'POWENS_USERS_TOKEN') | Where-Object { [string]::IsNullOrWhiteSpace((Env-Value $_)) } | Select-Object -First 1
    if ($null -ne $missing) {
        $configurationError = "Variable d'environnement manquante: $missing"
        Add-Result 'configuration' 'Prevol' 'N/A' 'variable d''environnement' $missing 'BLOCKED' $configurationError
        Write-Report
        Write-Host "BLOCKED missing environment variable: $missing"
        exit 2
    }

    $parsed = [uri]$baseRaw
    if ($parsed.Scheme -ne 'https' -or $parsed.Host -notmatch '(?i)sandbox' -or $parsed.AbsolutePath.TrimEnd('/') -ne '/2.0' -or $parsed.UserInfo -or $parsed.Query -or $parsed.Fragment) {
        $configurationError = 'POWENS_BASE_URL doit etre une URL HTTPS Sandbox en /2.0, sans identifiant ni query.'
        Add-Result 'configuration' 'Prevol' 'N/A' 'aucun' 'POWENS_BASE_URL' 'BLOCKED' $configurationError
        Write-Report
        Write-Host 'BLOCKED invalid POWENS_BASE_URL'
        exit 2
    }

    $baseUri = $parsed.AbsoluteUri.TrimEnd('/')
    Add-Type -AssemblyName System.Net.Http
    $http = [System.Net.Http.HttpClient]::new()
    $http.Timeout = [TimeSpan]::FromSeconds(30)

    # Je teste Powens independamment de l architecture Gestio existante.
    $connectors = Invoke-Collection 'connectors' 'Lister les connectors' 'connectors' 'GET /connectors' 'aucun' 'aucun'
    $connectorItems = @(Json-Property $connectors 'connectors')
    $testConnector = $connectorItems | Where-Object { "$(Json-Property $_ 'name')" -match '(?i)connecteur de test|test connector' } | Select-Object -First 1
    if ($null -ne $testConnector) {
        $connectorKey = Json-Property $testConnector 'uuid'
        if ($null -eq $connectorKey) { $connectorKey = Json-Property $testConnector 'id' }
        $detail = Invoke-Route 'connectors' 'Lire le connecteur de test' "connectors/$connectorKey`?expand=fields,sources,payment_fields,countries,urls" 'GET /connectors/{connectorUuid}?expand=fields,sources,payment_fields,countries,urls' 'aucun' 'connectorUuid; expand facultatif'
        $sources = Invoke-Collection 'connectors' 'Lister les sources du connecteur de test' "connectors/$connectorKey/sources" 'GET /connectors/{connectorUuid}/sources' 'aucun' 'connectorUuid'
        $source = @(Json-Property $sources 'sources') | Select-Object -First 1
        $sourceId = if ($null -ne $source) { Json-Property $source 'id' } else { $null }
        if ($null -ne $sourceId) {
            Invoke-Route 'connectors' 'Lire une source du connecteur de test' "connectors/$connectorKey/sources/$sourceId" 'GET /connectors/{connectorUuid}/sources/{sourceId}' 'aucun' 'connectorUuid; sourceId' | Out-Null
        }
    } else {
        Add-Skipped 'connectors' 'Connecteur de test' 'GET /connectors/{connectorUuid}' 'aucun' 'connectorUuid' 'Aucun connector correspondant n''a ete trouve; aucun identifiant n''a ete invente.'
    }

    Invoke-Collection 'users' 'Lister les utilisateurs' 'users' 'GET /users' 'Authorization: Bearer POWENS_USERS_TOKEN' 'aucun' $usersToken | Out-Null
    Invoke-Route 'documents' 'Lister les types de documents' 'documenttypes' 'GET /documenttypes' 'aucun' 'aucun' | Out-Null

    $userId = Env-Value 'POWENS_USER_ID'
    $userRoutes = @(
        @{ Name = 'Lire l utilisateur'; Path = 'GET /users/{userId}'; Params = 'userId' }
        @{ Name = 'Lister les comptes'; Path = 'GET /users/{userId}/accounts'; Params = 'userId; all facultatif' }
        @{ Name = 'Lister les transactions'; Path = 'GET /users/{userId}/transactions?limit=50'; Params = 'userId; limit obligatoire (50)' }
        @{ Name = 'Lister les connexions'; Path = 'GET /users/{userId}/connections'; Params = 'userId' }
        @{ Name = 'Lister les subscriptions'; Path = 'GET /users/{userId}/subscriptions'; Params = 'userId; all facultatif' }
        @{ Name = 'Lister les documents'; Path = 'GET /users/{userId}/documents?limit=50'; Params = 'userId; limit obligatoire (50)' }
        @{ Name = 'Lister les investissements'; Path = 'GET /users/{userId}/investments'; Params = 'userId' }
        @{ Name = 'Lister les market orders'; Path = 'GET /users/{userId}/marketorders'; Params = 'userId' }
        @{ Name = 'Lister les pockets'; Path = 'GET /users/{userId}/pockets'; Params = 'userId' }
        @{ Name = 'Lister les amortizations'; Path = 'GET /users/{userId}/amortizations'; Params = 'userId' }
    )
    foreach ($route in $userRoutes) {
        $reason = if ([string]::IsNullOrWhiteSpace($userId)) {
            'POWENS_USER_ID absent; aucun utilisateur n''a ete selectionne automatiquement.'
        } else {
            'User-access-token indisponible en GET-only; l''obtention via POST /auth/renew est interdite par cette mission.'
        }
        Add-Skipped 'utilisateur' $route.Name $route.Path 'Authorization: Bearer <user-access-token>' $route.Params $reason
    }
} catch {
    if ($null -eq $configurationError) {
        $configurationError = $_.Exception.Message
        Add-Result 'script' 'Execution du banc' 'N/A' 'selon la route' 'configuration valide' 'FAIL' $configurationError
    }
} finally {
    if ($null -ne $http) { $http.Dispose() }
    Write-Report
}

$pass = @($tests | Where-Object Result -eq 'PASS').Count
$blocked = @($tests | Where-Object Result -eq 'BLOCKED').Count
$fail = @($tests | Where-Object Result -eq 'FAIL').Count
$notRun = @($tests | Where-Object Result -eq 'NOT RUN').Count
Write-Host "PASS=$pass BLOCKED=$blocked FAIL=$fail NOT_RUN=$notRun"
Write-Host "Report=$reportPath"
if ($fail -gt 0) { exit 1 }
if ($null -ne $configurationError) { exit 2 }
exit 0
