# 修复前端权重配置的PowerShell脚本

$file = "frontend\src\pages\MethodsPage_new.tsx"

# 读取文件内容（使用UTF8编码）
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# 修改仪器分析阶段的权重配置
$content = $content -replace 'value="Balanced">均衡.[^<]+\(S:0\.25 H:0\.15 E:0\.15 P:0\.25 R:0\.10 D:0\.10\)', 'value="Balanced">均衡型 (S:0.15 H:0.15 E:0.15 P:0.25 R:0.15 D:0.15)'
$content = $content -replace 'value="Eco_Priority">环保优先.[^<]+\(S:0\.15 H:0\.10 E:0\.45 P:0\.10 R:0\.10 D:0\.10\)', 'value="Eco_Friendly">环保优先型 (S:0.10 H:0.10 E:0.30 P:0.10 R:0.25 D:0.15)'
$content = $content -replace 'value="Efficiency_Priority">能效优先.[^<]+\(S:0\.10 H:0\.10 E:0\.10 P:0\.40 R:0\.15 D:0\.15\)', 'value="Energy_Efficient">能效优先型 (S:0.10 H:0.10 E:0.15 P:0.40 R:0.15 D:0.10)'

# 修改样品前处理阶段的权重配置
$content = $content -replace 'value="Balanced">均衡.[^<]+\(S:0\.25 H:0\.20 E:0\.20 R:0\.175 D:0\.175\)', 'value="Balanced">均衡型 (S:0.20 H:0.20 E:0.20 R:0.20 D:0.20)'
$content = $content -replace 'value="Operation_Protection">操作防护.[^<]+\(S:0\.40 H:0\.30 E:0\.10 R:0\.10 D:0\.10\)', 'value="Operation_Protection">操作防护型 (S:0.35 H:0.35 E:0.10 R:0.10 D:0.10)'
$content = $content -replace 'value="Circular_Economy">循环经济.[^<]+\(S:0\.10 H:0\.10 E:0\.20 R:0\.30 D:0\.30\)', 'value="Circular_Economy">循环经济型 (S:0.10 H:0.10 E:0.10 R:0.40 D:0.30)'
$content = $content -replace 'value="Environmental_Tower">环境白塔.[^<]+\(S:0\.15 H:0\.15 E:0\.50 R:0\.10 D:0\.10\)', 'value="Environmental_Tower">环境白塔型 (S:0.15 H:0.15 E:0.40 R:0.15 D:0.15)'

# 写回文件
[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)

Write-Host "Done!" -ForegroundColor Green
