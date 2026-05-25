# ============================================================
# Deploy the 'Product Automation' workflow to n8n via REST API
# ============================================================

$N8N_URL = "http://localhost:5678"
$API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMzE2MTkwNS1iMGI0LTQ1ZGUtOTc5Yy0zN2Y3MWJiNDhhMjIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiN2JiZTQ0ZmQtNzkxYi00ZWI2LThjOGItNjVjOTVmZDhjMTg3IiwiaWF0IjoxNzc5NjMzNTEwfQ.vdmC0R6iZ51h_QJidtW23SHGeeIntAtPsBQLsBuGNgM"

$workflowJson = @'
{
  "name": "Product Automation",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{ "field": "hours", "hoursInterval": 2 }]
        }
      },
      "id": "node-schedule",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [0, 300]
    },
    {
      "parameters": {
        "url": "https://rss.app/feeds/amazon-deals.xml",
        "options": {}
      },
      "id": "node-rss",
      "name": "RSS Feed Read",
      "type": "n8n-nodes-base.rssFeedRead",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "jsCode": "return items.map(item => {\n  function extractPrice(text) {\n    const match = text.match(/\\$([0-9]+(\\.[0-9]+)?)/);\n    return match ? parseFloat(match[1]) : 0;\n  }\n  return {\n    json: {\n      title: item.json.title || '',\n      link: item.json.link || '',\n      description: item.json.contentSnippet || item.json.description || '',\n      price: extractPrice(item.json.content || item.json.description || '')\n    }\n  };\n});"
      },
      "id": "node-extract",
      "name": "Extract Product Fields",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [480, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.price }}",
              "operation": "larger",
              "value2": 10
            }
          ]
        }
      },
      "id": "node-filter",
      "name": "Filter Invalid Entries",
      "type": "n8n-nodes-base.filter",
      "typeVersion": 2,
      "position": [720, 300]
    },
    {
      "parameters": {
        "batchSize": 5,
        "options": {}
      },
      "id": "node-batch",
      "name": "Split In Batches",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [960, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            { "name": "key", "value": "YOUR_GEMINI_API_KEY" }
          ]
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Content-Type", "value": "application/json" }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"contents\": [\n    {\n      \"parts\": [\n        {\n          \"text\": \"You are an elite affiliate marketing analyst.\\n\\nYour job is to evaluate products for affiliate marketing profitability.\\n\\nAnalyze the product using these factors:\\n\\n1. Market demand\\n2. Emotional buying trigger\\n3. Problem-solving capability\\n4. Impulse-buy potential\\n5. Ease of conversion\\n6. Social media virality\\n7. Target audience clarity\\n8. Pricing attractiveness\\n\\nReturn STRICT JSON only.\\n\\nScoring Rules:\\n1-3 = Poor affiliate product\\n4-6 = Average potential\\n7-8 = Strong affiliate potential\\n9-10 = Viral/high-conversion potential\\n\\nJSON FORMAT:\\n\\n{\\n  \\\"score\\\": number,\\n  \\\"reason\\\": \\\"short explanation\\\",\\n  \\\"niche\\\": \\\"product niche\\\",\\n  \\\"conversionPotential\\\": \\\"Low | Medium | High\\\"\\n}\\n\\nProduct:\\nTITLE: {{ $json.title }}\\nDESCRIPTION: {{ $json.description }}\\nPRICE: {{ $json.price }}\"\n        }\n      ]\n    }\n  ]\n}",
        "options": {}
      },
      "id": "node-gemini",
      "name": "Gemini AI Analysis",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1200, 300]
    },
    {
      "parameters": {
        "jsCode": "// Parse the Gemini response and merge with original product data\nconst results = [];\nfor (const item of items) {\n  try {\n    const text = item.json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';\n    // Remove markdown code fences if present\n    const cleaned = text.replace(/```json\\n?/g, '').replace(/```\\n?/g, '').trim();\n    const analysis = JSON.parse(cleaned);\n    results.push({\n      json: {\n        ...item.json._originalData,\n        score: analysis.score || 0,\n        reason: analysis.reason || '',\n        niche: analysis.niche || '',\n        conversionPotential: analysis.conversionPotential || 'Low'\n      }\n    });\n  } catch(e) {\n    results.push({\n      json: { ...item.json, score: 0, parseError: e.message }\n    });\n  }\n}\nreturn results;"
      },
      "id": "node-parse",
      "name": "Parse AI Response",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1440, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.score }}",
              "operation": "largerEqual",
              "value2": 7
            }
          ]
        }
      },
      "id": "node-score-check",
      "name": "IF Score >= 7",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [1680, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/products/process",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "Bearer ammazkaAqzsed@123" },
            { "name": "Content-Type", "value": "application/json" }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"title\": \"{{ $json.title }}\",\n  \"link\": \"{{ $json.link }}\",\n  \"price\": {{ $json.price }},\n  \"score\": {{ $json.score }},\n  \"reason\": \"{{ $json.reason }}\",\n  \"niche\": \"{{ $json.niche }}\",\n  \"conversionPotential\": \"{{ $json.conversionPotential }}\",\n  \"source\": \"Amazon RSS\"\n}",
        "options": {}
      },
      "id": "node-post-nextjs",
      "name": "POST to Next.js API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1920, 200]
    },
    {
      "parameters": {
        "jsCode": "console.log('Product successfully processed:', $input.all().map(i => i.json.title).join(', '));\nreturn items;"
      },
      "id": "node-log",
      "name": "Log Success",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [2160, 200]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [{ "node": "RSS Feed Read", "type": "main", "index": 0 }]
      ]
    },
    "RSS Feed Read": {
      "main": [
        [{ "node": "Extract Product Fields", "type": "main", "index": 0 }]
      ]
    },
    "Extract Product Fields": {
      "main": [
        [{ "node": "Filter Invalid Entries", "type": "main", "index": 0 }]
      ]
    },
    "Filter Invalid Entries": {
      "main": [
        [{ "node": "Split In Batches", "type": "main", "index": 0 }]
      ]
    },
    "Split In Batches": {
      "main": [
        [{ "node": "Gemini AI Analysis", "type": "main", "index": 0 }],
        [{ "node": "Gemini AI Analysis", "type": "main", "index": 0 }]
      ]
    },
    "Gemini AI Analysis": {
      "main": [
        [{ "node": "Parse AI Response", "type": "main", "index": 0 }]
      ]
    },
    "Parse AI Response": {
      "main": [
        [{ "node": "IF Score >= 7", "type": "main", "index": 0 }]
      ]
    },
    "IF Score >= 7": {
      "main": [
        [{ "node": "POST to Next.js API", "type": "main", "index": 0 }],
        []
      ]
    },
    "POST to Next.js API": {
      "main": [
        [{ "node": "Log Success", "type": "main", "index": 0 }]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}
'@

$headers = @{
    "X-N8N-API-KEY" = $API_KEY
    "Content-Type"  = "application/json"
}

try {
    $result = Invoke-RestMethod -Uri "$N8N_URL/api/v1/workflows" -Method POST -Headers $headers -Body $workflowJson -ErrorAction Stop
    Write-Output "SUCCESS: Workflow 'Product Automation' created with ID: $($result.id)"
    Write-Output "Workflow Name: $($result.name)"
    Write-Output ""
    Write-Output "IMPORTANT: Open n8n at http://localhost:5678 and replace 'YOUR_GEMINI_API_KEY' in the Gemini AI node with your actual API key."
} catch {
    Write-Output "ERROR creating workflow: $_"
}
