import json

def user():
  return response.json(auth.user)

@auth.requires_login()
def boards():
  b = db(db.board.created_by == auth.user.id).select()
  return response.json(b or [])

@auth.requires_login()
def board():
  if request.args(0) is not None:
    b = db(db.board.url == request.args(0)).select()
    return response.json(b or [])
  return response.json([])

@auth.requires_login()
def add_board():
  body = request.vars
  if body.name is not None and body.type is not None:
    db.board.insert(name=body.name, board_type=body.type, is_public=body.is_public)
    return True
  return False

@auth.requires_login()
def delete_board():
  if request.args(0) is not None:
    q = (db.board.created_by == auth.user.id) & (db.board.id == request.args(0))
    db(q).delete()
    return True
  return False

@auth.requires_login()
def edit_board_instruction():
  body = request.vars
  if request.args(0) is not None:
    q = db.board.id == request.args(0)
    board = db(q).select().first()
    if board is not None and (board.is_public or db.board.created_by == auth.user.id):
      board.update_record(instruction=body.instruction)
      return True
  return False

@auth.requires_login()
def edit_board_name():
  body = request.vars
  if request.args(0) is not None:
    q = (db.board.created_by == auth.user.id) & (db.board.id == request.args(0))
    board = db(q).select().first()
    if board is not None:
      board.update_record(name=body.name)
      return True
  return False

@auth.requires_login()
def edit_board_is_public():
  body = request.vars
  if request.args(0) is not None:
    q = (db.board.created_by == auth.user.id) & (db.board.id == request.args(0))
    board = db(q).select().first()
    if board is not None:
      if body.is_public is not None:
        board.update_record(is_public=body.is_public)
      else:
        board.update_record(is_public=not board.is_public)
    return True
  return False
  
