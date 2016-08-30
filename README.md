##Base URL: http://openroads-geostore.appspot.com

#Login Oauth

###GET /login/authorize

The oauth login url where the user will be required to login using their email and password. After logging in, the user will be redirected to the redirect url parameter provided with a code that will be used to fetch the user account details.

**Parameters:**

- **r** - The redirect url where the user will be redirected after logging in. (*required*)

**Example:** http://openroads-geostore.appspot.com/login/authorize?r=http%3A//sample.com


###POST /login/verify/[code]

Using the code provided after logging in, verify if the user has been logged in and fetch the user account details.

**Parameters:**

- **nonce** - *String.* A random unique string to identify this request. This is used as a security measure. **required*
- **timestamp** - *Integer.* The UNIX Timestamp of the current date and time. This is used as a security measure. **required*

**Headers:**

- **X-Signature** - The signature is calculated by passing the **API LOGIN KEY** and the BASE STRING to the HMAC-SHA256 function and encoding the result into BASE64.
- **Content-Type** - Set the content-type to "application/json".

**Generating the signature:**

**1.** Convert the HTTP request method to uppercase, percent encode the URL and the parameter string (*nonce & timestamp*). Join the request method, percent encoded URL and the percent encoded parameterusing the '&' character. The steps should look like the sample code below.
```sh
url = 'http://openroads-geostore.appspot.com/login/verify'
request_body = {"timestamp": 1434418141, "nonce": "g87yjWloRUlhxJWN"}
base_string ='&'.join(['POST', urllib.quote(url), urllib.quote(request_body)])
```
**2.** Calculate the signature. The signature is calculated by passing the API LOGIN KEY and the BASE STRING to the HMAC-SHA256 function and encoding the result into BASE64:
```sh
signature = base64.b64encode(hmac.new(api_login_key, base_string, hashlib.sha256).digest()).decode()
```
**3.** Place the calculated SIGNATURE in the request header using the "X-Signature" label.
```sh
header = {"X-Signature": signature}
```

**Sample Request Body: **
```sh
url = "http://openroads-geostore.appspot.com/login/verify/AaYxU0xv8T20zsAC0w8lVV6BJxMFDtgh4BVWmGKYQJTTQTIOIemK89Gs0ypSpBebEtCLvmN5tZEauUcZ1VTl"
response = HTTPPostRequest(url, request_body, headers)
```

**Sample Response:**

```json
{
    "status": "APPROVED",
    "last_name": "kent",
    "created_time": "05/05/2015 02:27:02 PM",
    "code": 200,
    "salutation": "Mr.",
    "id": "5165917944152064",
    "first_name": "kent",
    "middle_name": "",
    "agency": "METROPOLITAN MANILA DEVELOPMENT AUTHORITY",
    "role": "AGENCYADMIN",
    "department": "ALLOCATIONS TO LOCAL GOVERNMENT UNITS",
    "email": "kent+aa@sym.ph",
    "username": "",
    "expires": 1432164384.0,
    "operating_unit": "METROPOLITAN MANILA DEVELOPMENT AUTHORITY",
    "mobile_number": "",
    "active": true,
    "response": "Successful",
    "permissions": ["UACS_ID->360010000000"],
    "name": "kent astudillo",
    "designation": "NONE",
    "region": "METROPOLITAN MANILA DEVELOPMENT AUTHORITY",
    "token": "JEUNv2GLSLkvtTBj49zCS9PWrPoA8Yccb02gRVvGL3nyU565prRqynY4CxDegFNtvyTbxGnTL330dSLALHFOxO",
    "uacs": "360010000000"
}
```

#Geostore API

### POST /api/v1/data

Upload data into the geostore service. This endpoint supports text, files, images, video, numbers, and arbitrary string data.


**Parameters:**

- **indexed_[name]** - indexed property where [name] is the name of the custom field. Queryable.
- **unindexed_[name]** - unindexed property where [name] is the name of the custom field. NOT queryable.
- **file_[name]** - file, image, or video where [name] is the name of the custom file field.

**Example:** POST http://openroads-geostore.appspot.com/api/v1/data

**Sample Request Body:**

```
indexed_type=IMAGE
indexed_latlng=13.73643281,114.8694948
indexed_parent_code=B51CA68D-FD5B-4BF5-8424-29892A7CDC88
indexed_agency=DA
indexed_program=PRDP
indexed_project_code=PRDP-IB-R009-ZSP-014-000-000-2015
file_image=w0i62APykSjwLGo1w7FxBqjl4Tn1cNBd7WkDT6HvgJHte8mi10Z2c8YAf6BXGGKqh8oznMZ9LHEqiDK8OacvoFXVCWFo3wHOEwvQCyjq5UnlDEXjBrAQzFyiciiVOsdc\==
```


### POST /api/v1/data/[id]

Update data in the geostore service. Updates to the data in the GeoStore service are automatically versioned. This modifies the data and automatically creates a new version. New fields are added. Existing fields are updated.


**Parameters:**

- **indexed_[name]** - indexed property where [name] is the name of the custom field. Queryable.
- **unindexed_[name]** - unindexed property where [name] is the name of the custom field. NOT queryable.
- **file_[name]** - file, image, or video where [name] is the name of the custom file field.

Example: POST http://openroads-geostore.appspot.com/api/v1/data/845637892145785657

**Sample Request Body:**

```
unindexed_description=Updated%20Project%20Description%20goes%20here.
```


### DELETE /api/v1/data/[id]

Delete data from the geostore service.


Example: DELETE http://openroads-geostore.appspot.com/api/v1/data/845637892145785657




### GET /api/v1/data

Query data from the geostore service. Supports flexible querying


**Parameters:**

- **[custom_field_name]** - Filter query by the value of any indexed custom field.
- **sort** - Indicate if results should be sorted by ascending or descending. Default ascending.
- **cursor** - Pagination or Bookmarking support.
- **version** - Get the latest version of the data immediately preceding the UNIX timestamp given.
- **start_updated_from** - Get the data whose created date matches the given parameter preceding the UNIX timestamp given.
- **start_created_from** - Get the  whose updated date matches the given parameter preceding the UNIX timestamp given.


Example: http://openroads-geostore.appspot.com/api/v1/data?type=IMAGE&cursor=CkYKGQoMY3JlYXRlZF90aW1lEgkIhqXXwZ-mygISJWoNc35jb2FnZW9zdG9yZXIUCxIHQVBJRGF0YRiAgICgndrbCAwYACAB

### GET /api/v1/data/*id*

Query data from the geostore service with data id.

Example: http://openroads-geostore.appspot.com/api/v1/data/4503601506418688

#PSGC

### GET /api/v1/psgc

Get the complete list of Philippine Standard Geographic Codes of all the provinces and municipalities.


**Parameters:**

- **code** - indexed code of the province or municipality.

**Sample Request Body:**

```sh
url = 'http://openroads-geostore.appspot.com/api/v1/psgc?code=012800000'
```

**Sample Response:**

```json
[
    {
        code: "012800000",
        type: "PROVINCE",
        name: "ILOCOS NORTE"
    }
]
```

#Workspaces

### GET /api/v1/environments

Get the list of the environments the current user belongs to.

**Sample Request Body:**

```sh
url = 'http://openroads-geostore.appspot.com/api/v1/environments'
```

**Sample Response:**

```json
{
    code: 200,
    type: "List of geostore environments.",
    response: "OK",
    cursor: "",
    data: []
}
```

#Proxy

### GET /api/v1/proxy

Use the geostore service API as a proxy to load another webpage's content.

**Sample Request Body:**

```sh
url = 'http://openroads-geostore.appspot.com/api/v1/proxy?url=http%3A%2F%2Fhttpbin.org%2Fget'
```

**Sample Response:**

```json
{
  "args": {},
  "headers": {
    "Accept-Encoding": "gzip,deflate",
    "Host": "httpbin.org",
    "User-Agent": "AppEngine-Google; (+http://code.google.com/appengine; appid: s~coageostore)",
    "X-Cloud-Trace-Context": "ed6072698599209056474029f21d641e/4696597461335533285;o=1"
  },
  "origin": "107.178.195.219",
  "url": "http://httpbin.org/get"
}
```