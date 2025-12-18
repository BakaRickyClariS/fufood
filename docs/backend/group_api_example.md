呼叫時加上 credentials: "include" 就會有 cookies

# GET /api/v1/refrigerators: list all refrigerators
GET http://localhost:3000/api/v1/refrigerators
Accept: application/json
Cookie: access_token={{ accessToken }}

<> 2025-12-18T133102.200.json 

###
POST http://localhost:3000/api/v1/refrigerators
Accept: application/json
Content-Type: application/json
Cookie: access_token={{ accessToken }}

{
  "name": "哇欸冰箱",
  "colour": "#00f"
}

<> 2025-12-18T133227.201.json

###
PUT http://localhost:3000/api/v1/refrigerators/{{ refrigeratorId }}
Accept: application/json
Content-Type: application/json
Cookie: access_token={{ accessToken }}

{
  "name": "已更新過的冰箱資料",
  "colour": "#f00"
}

<> 2025-12-18T133335.200.json

###
DELETE http://localhost:3000/api/v1/refrigerators/{{ refrigeratorId }}
Accept: application/json
Cookie: access_token={{ accessToken }}