# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime
import uuid

def get_user_email():
    return auth.user.email if auth.user else None

db.define_table('board',
    Field('created_on', 'datetime', default=request.now),
    Field('created_by', 'reference auth_user', default=auth.user_id),
    Field('instruction', 'blob'),
    Field('name', 'text', default='New Board'),
    Field('is_public', 'boolean', default=False),
    Field('url', 'string', default=uuid.uuid4),
    Field('board_type', 'text')
)



# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
