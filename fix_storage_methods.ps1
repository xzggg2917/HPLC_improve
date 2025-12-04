# 批量修复 MethodsPage.tsx 中的 localStorage 调用
$file = "frontend/src/pages/MethodsPage.tsx"
$content = Get-Content $file -Raw

# 替换规则
$content = $content -replace "localStorage\.getItem\('hplc_factors_data'\)", "await StorageHelper.getJSON(STORAGE_KEYS.FACTORS)"
$content = $content -replace "localStorage\.getItem\('hplc_gradient_data'\)", "await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)"  
$content = $content -replace "localStorage\.getItem\('hplc_methods_raw'\)", "await StorageHelper.getJSON(STORAGE_KEYS.METHODS)"
$content = $content -replace "localStorage\.getItem\('hplc_score_results'\)", "await StorageHelper.getJSON(STORAGE_KEYS.SCORE_RESULTS)"
$content = $content -replace "localStorage\.setItem\('hplc_gradient_data',\s*JSON\.stringify\(([^\)]+)\)\)", 'await StorageHelper.setJSON(STORAGE_KEYS.GRADIENT, $1)'
$content = $content -replace "localStorage\.setItem\('hplc_methods_raw',\s*([^\)]+)\)", 'await StorageHelper.setJSON(STORAGE_KEYS.METHODS, JSON.parse($1))'
$content = $content -replace "localStorage\.setItem\('hplc_score_results',\s*JSON\.stringify\(([^\)]+)\)\)", 'await StorageHelper.setJSON(STORAGE_KEYS.SCORE_RESULTS, $1)'

# 保存
Set-Content $file $content -NoNewline

Write-Host "✅ MethodsPage.tsx localStorage 调用已修复" -ForegroundColor Green
