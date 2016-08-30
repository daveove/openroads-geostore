import json
from application.handlers.base import BaseHandler

class PSGCHandler(BaseHandler):
    def get(self):
        output = []
        with open('psgc.json', 'rb') as f:
            data = json.loads(f.read().decode('latin-1'))
        # TODO
        psgc_type = self.request.get('type').lower()
        psgc_code = self.request.get('code')
        if psgc_type or psgc_code:
            for row in data:
                if psgc_type:
                    if row['type'] == psgc_type.upper():
                        output.append(row)
                if psgc_code:
                    if row['code'] == psgc_code:
                        output.append(row)
        else:
            output = data
        # ENDTODO
        self.response.headers['Content-Type'] = 'application/json'
        self.response.set_status(200)
        self.response.write(json.dumps(output))