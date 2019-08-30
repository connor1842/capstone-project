#-------------------------------------------------------------------------------
# Project: Vehicle Registration and Recognition System
# Team: Felis
# Author: Riley Kraft
# Date: 03/17/2019
# Description: main.py serves as the API and authorization server for the
#              MyGarage web app. This program includes all HTTP requests,
#              along with the authorization and authentication parameters,
#              required for the app.
#-------------------------------------------------------------------------------
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from google.appengine.ext import ndb
from google.appengine.api import mail
import jwt
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm
import json
import random
import string
import hashlib
import datetime
from datetime import timedelta

jwt.register_algorithm('RS256', RSAAlgorithm(RSAAlgorithm.SHA256))
app = Flask(__name__)
app.config["DEBUG"] = True
app.config['CORS_HEADERS'] = 'Content-Type', 'Authorization'
app.config['CORS_SUPPORTS_CREDENTIALS'] = True



#------------------------------ Begin Model Classes ----------------------------

class User(ndb.Model):
    username = ndb.StringProperty()
    email = ndb.StringProperty()
    password = ndb.StringProperty()
    salt = ndb.StringProperty()
    address = ndb.StringProperty()
    phone = ndb.IntegerProperty()
    admin = ndb.BooleanProperty()
    master_admin = ndb.BooleanProperty()
    last_login = ndb.DateTimeProperty()
    
class Blacklist(ndb.Model):
    token = ndb.StringProperty()
    timestamp = ndb.DateTimeProperty()
    
class Vehicle(ndb.Model):
    userID = ndb.IntegerProperty()
    plate_number = ndb.StringProperty()
    state = ndb.StringProperty()
    color = ndb.StringProperty()
    type = ndb.StringProperty()
    guest = ndb.BooleanProperty()
    blocked = ndb.BooleanProperty()
    entryID = ndb.IntegerProperty()
    expiration_date = ndb.DateTimeProperty()
    
class Entry(ndb.Model):
    vehicleID = ndb.IntegerProperty()
    plate_number = ndb.StringProperty()
    state = ndb.StringProperty()
    color = ndb.StringProperty()
    type = ndb.StringProperty()
    denied = ndb.BooleanProperty()
    timestamp = ndb.DateTimeProperty()
    
class Message(ndb.Model):
    subject = ndb.StringProperty()
    message = ndb.StringProperty()
    timestamp = ndb.DateTimeProperty()
    
class UserMessage(ndb.Model):
    userID = ndb.IntegerProperty()
    messageID = ndb.IntegerProperty()
    unread= ndb.BooleanProperty()
    
#------------------------------- End Model Classes -----------------------------



#----------------------------- Begin Model Functions ---------------------------

#-------------------------------------------------------------------------------
# Details: getSalt() queries for the User object in the datastore whose email 
#          matches the username provided at login. If an object was returned, 
#          then the function returns the User object's salt property value.
# Params: username (str)
# Returns: salt (str)
#-------------------------------------------------------------------------------
def getSalt(u): 
  query = User.query().filter(User.email == u)       # Query username
  for entity in query:                               # If User found
    return entity.salt                                 # Return User's salt

#-------------------------------------------------------------------------------
# Details: createHash() adds the user's salt value to the end of their provided 
#          password, calls on the SHA256 algorithm, and encodes the full string.
# Params: password (str), salt (str)
# Returns: hash password (str)
#-------------------------------------------------------------------------------
def createHash(p, s):
  password = p + s                          # Concatenate password and salt
  h = hashlib.sha256()                      # Choose SHA256 hash algorithm
  h.update(password.encode('utf-8'))        # Encode password with hash
  return h.hexdigest()                      # Return hashed password string

#-------------------------------------------------------------------------------
# Details: random_generator() generates and returns a random alpha-numeric 
#          string of length specified in the parameter.
# Params: length of salt (int)
# Returns: salt (str)
#-------------------------------------------------------------------------------
def random_generator(s):
  return ''.join(random.choice(string.ascii_letters + string.digits) \
  for x in range(s))

#-------------------------------------------------------------------------------
# Details: verifyLogin() takes the user's login username and hashed 
#          password, queries for the User object in the datastore, and confirms 
#          whether or not the user's password and the User object's password 
#          match.
# Called From: login()
# Params: username (str), hashed password (str)
# Returns: True or Null
#-------------------------------------------------------------------------------
def verifyLogin(u, p): 
  query = User.query().filter(User.email == u)       # Query username
  for entity in query:                               # If User found
    if entity.password == p:                         # If passwords match
      return True                                      # Return true                                    
                                                     # Else, return null
                                                       
#-------------------------------------------------------------------------------
# Details: verifyAdminToken() validates that an access token belongs to an
#          existing admin user
# Params: access token (str)
# Returns: null OR status code and message (str)
#-------------------------------------------------------------------------------
def verifyAdminToken(access_token): 
  if access_token is None or\
  access_token == '':                                # If no token
    return json.dumps(
        {"error": "No token found"}), 401              # Return error

  found = checkBlacklist(access_token)               # Check blacklist
  if found:                                          # If found
    return json.dumps(
        {"error": "Token blacklisted."}), 401          # Return error
    
  res = checkJWT(access_token)                       # Check credentials
  if not isinstance(res, basestring) or\
  not res.isdigit():                                 # If not access token
    return json.dumps(
        {"error": "Invalid access token."}), 401       # Return error
  else:                                              # Else
    user = User.get_by_id(int(res))                    # Get user by id
    
    if user is None:                                   # If user not found
      return json.dumps(
        {"error": "Token userID not found."}), 403       # Return error
    
    if not user.admin:                                 # If not an admin
      return json.dumps(
        {"error": "User is not an admin."}), 401         # Return error
        
    return res
                                                       
#-------------------------------------------------------------------------------
# Details: verifyUserToken() validates that an access token belongs to an
#          existing user
# Params: access token (str)
# Returns: userID OR status code and message (str)
#-------------------------------------------------------------------------------
def verifyUserToken(access_token): 
  if access_token is None or\
  access_token == '':                                # If no token
    return json.dumps(
        {"error": "No token found"}), 401              # Return error

  found = checkBlacklist(access_token)               # Check blacklist
  if found:                                          # If found
    return json.dumps(
        {"error": "Token blacklisted."}), 401          # Return error
    
  res = checkJWT(access_token)                       # Check credentials
  
  if not isinstance(res, basestring) or\
  not res.isdigit():                                 # If not access token
    return json.dumps(
        {"error": "Invalid access token."}), 401       # Return error
  else:                                              # Else
    user = User.get_by_id(int(res))                    # Get user by id
    
    if user is None:                                   # If user not found
      return json.dumps(
        {"error": "Token userID not found."}), 403       # Return error
    
    return res                                         # Else, return userID


#-------------------------------------------------------------------------------
# Details: createAccessToken() queries for the User by email in order to 
#          retrieve the userID. The userID is then used, along with the API's 
#          URL, user's email, timestamp, and an expiration time, to create an 
#          encoding payload. A private key, provided by the API, is used to 
#          encode the payload by the RS256 algorithm. The resulting code serves 
#          as the user's access token to use the web app and access their data.
# Called From: login()
# Params: email (str)
# Returns: access token (str)
#-------------------------------------------------------------------------------
def createAccessToken(u):
  query = User.query().filter(User.email == u)    # Get user
  for entity in query:                            # If found
    if entity.email == u:                           # If usernames match
      try:
        file = open('private.pem', 'rb')              # Get private key
        encode_key = file.read()
                
        payload = {
          "iss": 'https://felis-234504.appspot.com',
          "iat": datetime.datetime.utcnow(),
          "exp": datetime.datetime.utcnow() + \
                datetime.timedelta(days=0, \
                seconds=86400),
          "uid": entity.key.id(),
          "email": u
        }                                             # Create payload

        return jwt.encode(payload, \
            encode_key, algorithm = 'RS256')          # Return encoded payload
      except Exception as err:
        return err
            
#-------------------------------------------------------------------------------
# Details: createResetToken() queries for the User by email in order to retrieve 
#          the userID. The userID is then used, along with the API's URL, user's 
#          email, timestamp, and an expiration time, to create an encoding 
#          payload. A private key, provided by the API, is used to encode the 
#          payload by the RS256 algorithm. The resulting code serves as the 
#          user's access token to use the web app and access their data.
# Called From: forgotPassword()
# Params: username (str), address (str)
# Returns: reset token (str)
#-------------------------------------------------------------------------------
def createResetToken(u, a):
  query = User.query().filter(User.address == a)     # Get user
  entity = query.get()
  if entity.username == u:                           # If usernames match
    try:
      file = open('private.pem', 'rb')                 # Get private key
      encode_key = file.read()
            
      payload = {
        "iss": 'https://felis-234504.appspot.com',             
        "exp": datetime.datetime.utcnow() +\
                datetime.timedelta(days=0,\
                seconds=3600),
        "username": entity.username
      }                                                # Create payload

      return jwt.encode(payload, \
            encode_key, algorithm = 'RS256')         # Return encoded payload
    except Exception as err:
      return err
  
#-------------------------------------------------------------------------------
# Details: createRegistrationToken() queries for the User by email in order to 
#          retrieve the userID. The userID is then used, along with the API's 
#          URL, user's email, timestamp, and an expiration time, to create an 
#          encoding payload. A private key, provided by the API, is used to 
#          encode the payload by the RS256 algorithm. The resulting code serves 
#          as the user's access token to use the web app and access their data.
# Called From: inviteUser()
# Params: address (str), admin (bool)
# Returns: registration token (str)
#-------------------------------------------------------------------------------
def createRegistrationToken(addr, admin):
  try:
    file = open('private.pem', 'rb')                   # Get private key
    encode_key = file.read()
        
    payload = {                                        # Create payload:
      "iss": 'https://felis-234504.appspot.com',             # Issuer
      "exp": datetime.datetime.utcnow() +\
            datetime.timedelta(days=0,\
            seconds=259200),                             # Expiration time
      "addr": addr,                                      # User's address
      "admin": admin                                     # Admin status
    }

    return jwt.encode(payload, \
        encode_key, algorithm = 'RS256')               # Encode payload
  except Exception as err:
    return err

#-------------------------------------------------------------------------------
# Details: checkBlacklist() queries the datastore for all active access tokens 
#          that have been blacklisted. If the token's been blacklisted, even 
#          though it has not yet expired, the token will be returned as invalid.
# Params: access token (str)
# Returns: True / False (bool)
#-------------------------------------------------------------------------------
def checkBlacklist(t):
  query = Blacklist.query()                              # Get blacklist
  
  if len(query.fetch()) < 1:                             # If none in list
    return False                                           # Return false

  for entity in query:                                   # For each token
    if entity.token == t:                                  # If match found
      return True                                            # Return true

    if entity.timestamp <\
    (datetime.datetime.now() -\
    timedelta(seconds=259200)):                            # If expired
      ndb.Key(Blacklist, entity.key.id()).delete()           # Delete

  return False                                           # Else, return false
            
#-------------------------------------------------------------------------------
# Details: checkJWT() retrieves the API's public key to decode the access token
#          retrieved from the user's client. The userID is extracted from the 
#          token and returned to the calling function for verification. 
#          Otherwise, an error is returned for being from an invalid issuer API, 
#          being expired, or simply being invalid.
# Params: access token (str)
# Returns: token data
#-------------------------------------------------------------------------------
def checkJWT(t):
  file = open('public.pem', 'rb')                    # Get public key
  decode_key = file.read()

  try:
    d = jwt.decode(t, decode_key, 
        issuer = 'https://felis-234504.appspot.com', 
        algorithm = 'RS256')                         # Decode token
    d = json.dumps(d)                                # Convert to str
    d = json.loads(d)                                # Convert to json
    if 'username' in d:                              # If a reset token
      return str(d['username'])                        # Return username
    if 'uid' in d:                                   # If an access token
      return str(d['uid'])                             # Return userID
    if 'addr' in d:                                  # If a registration token
      return d                                         # Return token data
  except jwt.ExpiredSignatureError:
    return 'ERROR Login expired.'
  except (jwt.InvalidTokenError, 
    jwt.exceptions.InvalidIssuerError):
    return 'ERROR Invalid credentials.'
                             
#------------------------------ End Model Functions ----------------------------



#--------------------------- Begin Controller Functions ------------------------

#-------------------------------------------------------------------------------
# Details: after_request() sets the response headers to allow CORS requests.
# Called From: every request
# Params: request response
# Returns: response header
#-------------------------------------------------------------------------------
@app.after_request
def after_request(response):
  response.headers.add('Access-Control-Allow-Origin', '*')
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  response.headers.add('Access-Control-Allow-Credentials', 'true')
  return response

#-------------------------------------------------------------------------------
# Details: login() accepts the user's username and password input from the 
#          login page as their credentials, then checks the datastore for
#          a User entity match. If found, an access token is created and
#          returned.
# Called From: https://mygarage.appspot.com/login
# Params: username (str), password (str)
# Returns: [access token (str), userID (int), admin (bool)] (json), or
#          status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/login', methods=['POST'])
def login():
  data = request.get_json()                             # Get json data
    
  username = data.get('username')                       # Get username
  password = data.get('password')                       # Get password
  user = None
    
  if None in [username, password] or\
  username == '' or password == '':                     # If either are null
    return json.dumps(
        {"error": "Invalid Input"}), 400                  # Send error
    
  u = User.query().filter(User.username == username)    # Query for User
  item = u.get()                                        # Get first result
  if item is None:                                      # If result=null
    e = User.query().filter(User.email == username)       # Query for User
    entity = e.get()                                      # Get first result
    if entity is None:                                    # If result=null
      return json.dumps(
          {"error": "Username/Email not found."}), 404      # Return error
    else:                                                 # Else
      user = entity                                         # Save User
  else:                                                 # Else
    username = item.email                                 # Set username
    user = item                                           # Save User
    
  salt = getSalt(username)                              # Get User's salt
  hashpass = createHash(password, salt)                 # Hash password
  verified = verifyLogin(username, hashpass)            # Verify hashes match
  
  if verified:                                          # If they match
    access_token = createAccessToken(username)            # Create access token
    if access_token:                                      # If token created
      user.last_login = datetime.datetime.now()             # Reset last login
      user.put()                                            # Save to datastore
      return jsonify(
          {"access_token": access_token,
           "userID": user.key.id(),
           "admin": user.admin}), 201                       # Return token
    else:                                                 # Else
      return json.dumps(
        {"error": "Error issuing access token."}), 501      # Send error
  else:                                                 # Else
    return json.dumps(
        {"error": "Incorrect password."}), 403            # Send error
    
#-------------------------------------------------------------------------------
# Details: forgotPassword() accepts a user's email and address as parameters 
#          for resetting their passwords. If the email and address are found 
#          for a single user in the datastore, then a reset token will be 
#          created with the user's username. Once the token is created it's 
#          appended to a url, which is then emailed to the user's account email.
# Called From: https://mygarage.appspot.com/forgot
# Params: username (str), address (str)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/password', methods=['POST'])
def forgotPassword():
  data = request.get_json()                                 # Get json data
    
  username = data.get('username')                           # Get username
  address = data.get('address')                             # Get address
    
  if None in [username, address] or\
  username == '' or address == '':                          # If either=null
    return json.dumps(
        {"error": "Username and Address are required."}), 400 # Send error
    
  query = User.query()\
  .filter(User.username == username.lower())                # Query username
  item = query.get()                                        
  if item is None:                                          # If not found
    return json.dumps(
        {"error": "Username not found."}), 400                # Return error
    
  query = User.query()\
  .filter(User.address == address.upper())                  # Query address
  item = query.get()                                        
  if item is None:                                          # If not found
    return json.dumps(
        {"error": "Address not found."}), 400                 # Send error

  if item.username != username.lower():                     # If emails don't match
    return json.dumps(
      {"error": "Username and Address do not match."}), 400   # Send error
  else:                                                     # Else
    token = createResetToken(item.username, item.address)     # Create token
    url = "https://mygarage.appspot.com/password?token="+\
        token                                                 # Create url
        
    mail.send_mail(
      sender="MyGarage Admin <kraftme@oregonstate.edu>",
      to=item.email,
      subject="MyGarage Password Reset",
      body="Hello " + item.username + ",\n\n"+\
        "We recently received a request to change"+\
        " your MyGarage account password. Please "+\
        "visit the following link to reset your "+\
        "password.\nThe link will expire in 1 hour."+\
        "\n\n" + url + "\n\n"+\
        "If this message has been received in error,"+\
        " please disregard and your password will "+\
        "remain unchanged.\n\n"+\
        "Sincerely,\nThe MyGarage Team")                       # Send reset email
  
    return json.dumps(
      {"msg": "A link has been sent to"+\
      " your email to reset your password."}), 200             # Return message
        
#-------------------------------------------------------------------------------
# Details: resetPassword() allows a user to change their password via a reset
#          token, created from the username and address provided by the user.
# Called From: https://mygarage.appspot.com/reset
# Params: reset token (str), password (str)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/password', methods=['PUT'])
def resetPassword():
  data = request.get_json()                            # Get json data
  
  if data.get('new_password') is None or\
  data.get('new_password') == '' or\
  data.get('token') is None or\
  data.get('token') == '':                             # If missing info
    return json.dumps(
        {"error": "Missing information."}), 404          # Send error
    
  access_token = data.get('token')                     # Get token
  
  found = checkBlacklist(access_token)                 # Check blacklist
  if found:                                            # If found
    return json.dumps(
        {"error": "Token blacklisted."}), 401            # Return error
        
  new_password = data.get('new_password')              # Get new pass
  res = checkJWT(access_token)                         # Check reset token
    
  if not isinstance(res, basestring) or\
  "@" in res or res.isdigit() or\
  "ERROR" in res:                                      # If not reset token
    return json.dumps(
        {"error": "Invalid credentials."}), 404          # Send error
  else:                                                # Else
    query = User.query().filter(User.username == res)    # Query username
    entity = query.get()                                 # Get first result
    if entity is None:                                   # If result=none
      return json.dumps({"error": res}), 404               # Return error
    else:                                                # Else
      entity.salt = random_generator(10)                   # Get new salt
      hash = createHash(new_password, entity.salt)         # Create new hash
      entity.password = hash
      entity.put()                                         # Save to datastore
      
      newBlacklist = Blacklist(token=access_token,
                timestamp=datetime.datetime.now())         # Blacklist token
      newBlacklist.put()                                   # Save to datastore
      
      return json.dumps(
        {"msg": "Your password has been reset."}), 200     # Return message
    
#-------------------------------------------------------------------------------
# Details: logout() doesn't actually log the user out from the UI, rather it 
#          takes the user's currently valid access token and adds it to the 
#          datastore blacklist. Once the toke is blacklisted it can't be used 
#          again, thus the user would be required to login again to get a new, 
#          valid access token.
# Called From: https://mygaragea.appspot.com/logout
# Params: access token (str)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/logout', methods=['POST'])
def logout():
  access_token = request.headers.get('Authorization')  # Get token
  
  if access_token is not None and\
  access_token != '':                                  # If token exists
    newBlacklist = Blacklist(token=access_token,
                timestamp=datetime.datetime.now())       # Create blacklist
    newBlacklist.put()                                   # Save to datastore
    return json.dumps(
        {"msg": "You have been logged out."}), 200       # Return message
  return json.dumps(
        {"error": "You weren't logged in."}), 400      # Return message
        
#-------------------------------------------------------------------------------
# Details: getHomePage() queries the datastore for limited summary data that
#          is specific to the currently logged in user. This data is meant
#          to be displayed in the web app homepage widgets.
# Called From: https://mygarage.appspot.com/home
# Params: access token (str), userID (int)
# Returns: summary data (json)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>/home', methods=['GET'])
def getHomePage(userID):
  access_token = request.headers.get('Authorization')   # Get token
  
  verification = verifyUserToken(access_token)          # Verify token
  
  if not verification.isdigit():                        # If not access token
    return verification                                   # Return error res
    
  if int(verification) != userID:                       # If IDs don't match
    return json.dumps(
      {"error": "You don't own this account."}), 403      # Return message
      
  user = User.get_by_id(userID)                         # Get user
  residents = Vehicle.query().filter(ndb\
            .AND(Vehicle.userID == userID, 
            Vehicle.guest == False))                    # Get user's vehicles
  guests = Vehicle.query().filter(ndb\
            .AND(Vehicle.userID == userID, 
            Vehicle.guest == True))                     # Get guest vehicles
  
  if user is None:                                      # If user not found
    return json.dumps(
      {"error": "User ID not found."}), 403               # Return message
  
  entries = []
  vehicles = Vehicle.query()\
  .filter(Vehicle.userID == userID)                     # Get all vehicles
  for entity in vehicles:                               # For each vehicle
    entry = Entry.query()\
    .filter(Entry.vehicleID == entity.key.id())\
    .order(-Entry.timestamp).fetch(1)                     # Get last entry
    
    if len(entry) >= 1:
      entries.append(entry[0])
    
  g = c = t = p = s = ts = d = ""  
  if len(entries) >= 1:                                 # If 1+ entries found
    entries.sort(key=lambda e: e.timestamp, 
               reverse=True)                              # Sort entries
    entry = entries[0]                                      # Get most recent
    vehicle_entry = Vehicle.get_by_id(entry.vehicleID)      # Get vehicle
    
    g = vehicle_entry.guest
    c = vehicle_entry.color
    t = vehicle_entry.type
    p = vehicle_entry.plate_number
    s = vehicle_entry.state
    ts = entry.timestamp\
        .strftime("%m/%d/%Y, %H:%M:%S")
    d = entry.denied
  
  ids = []
  inbox = UserMessage.query()\
  .filter(UserMessage.userID == userID)                 # Get user's inbox
  
  sub = msg = md = ""
  if len(inbox.fetch()) >= 1:                           # If 1+ messages found
    for entity in inbox:                                  # For each object
      ids.append(entity.messageID)                          # Get messageID
    
    messages = []
    for id in ids:                                        # For each messageID
      m = Message.get_by_id(id)                             # Get message
      messages.append(m)
    
    messages.sort(key=lambda m: m.timestamp, 
                reverse=True)                             # Sort messages
    message = messages[0]                                   # Get most recent
    u = UserMessage.query()\
    .filter(ndb.AND(UserMessage.userID == userID, 
        UserMessage.messageID == message.key.id()))\
        .fetch(1)                                         # Get unread status
        
    sub = message.subject
    msg = message.message
    md = message.timestamp\
    .strftime("%m/%d/%Y, %H:%M:%S")
  
  data = {
    "address_widget": [{
        "community_name": "The OSU Apartments",
        "user_address": user.address,
        "city_state_zip": "Corvalis, OR 97330",
        "username": user.username,
        "email": user.email,
        "phone": user.phone
        }],
    "vehicles_widget": [{
        "num_resident": len(residents.fetch()),
        "num_guest": len(guests.fetch()),
        "last_entry": [{
            "guest": g,
            "color": c,
            "type": t,
            "plate": p,
            "state": s,
            "timestamp": ts,
            "denied": d
            }]
        }],
    "messages_widget": [{
        "subject": sub,
        "message": msg,
        "date": md
        }]
  }                                                      # Select data

  return jsonify(data), 200                              # Return data
    
#-------------------------------------------------------------------------------
# Details: getUsers() returns the entire list of users, and their vehicles, 
#          only if the requester is an admin.
# Called From: https://mygarage.appspot.com/community
# Params: access token (str)
# Returns: array of User entities, 
#          each with an array of Vehicle entities (json)
#-------------------------------------------------------------------------------
@app.route('/users', methods=['GET'])
def getUsers():
  access_token = request.headers.get('Authorization')   # Get token
  
  verification = verifyAdminToken(access_token)         # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                           # If not admin token
    return verification                                   # Return error res

  users = User.query()                                  # Get all users
  data = []
  for entity in users:                                  # For each user
    ll = None
    if entity.last_login is not None:                     # If has last login
      ll = entity.last_login\
      .strftime("%m/%d/%Y, %H:%M:%S")                       # Format date
  
    vehicles = Vehicle.query()\
    .filter(Vehicle.userID == entity.key.id())            # Get vehicles

    v = []
    for item in vehicles:                                 # For each vehicle
      ent = None
      if item.entryID is not None:                          # If has entryID
        entry = Entry.get_by_id(item.entryID)                 # Get entry
        ent = entry.timestamp\
        .strftime("%m/%d/%Y, %H:%M:%S")                       # Format date                    
      
      v.append(
        {"plate_number": item.plate_number,
         "state": item.state,
         "type": item.type,
         "color": item.color,
         "guest": item.guest,
         "blocked": item.blocked,
         "last_entry": ent
         })                                                 # Append data to array
    
  
    obj = {
      "id": entity.key.id(),
      "username": entity.username,
      "email": entity.email,
      "address": entity.address,
      "phone": entity.phone,
      "admin": entity.admin,
      "last_login": ll,
      "vehicles": v
    }                                                      # Select data
    data.append(obj)                                       # Add to array
  return jsonify(data), 200                              # Return array
  
#-------------------------------------------------------------------------------
# Details: inviteUser() allows an admin user to create a registration token
#          from an address and email, and sends the token to the provided
#          email address.
# Called From: https://mygarage.appspot.com/community
# Params: access token (str), address (str), email (str), admin (bool)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/invitation', methods=['POST'])
def inviteUser():
  access_token = request.headers.get('Authorization')  # Get token
  
  verification = verifyAdminToken(access_token)        # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                          # If not admin token
    return verification                                  # Return error res

  data = request.get_json()                            # Get json

  if None in [data.get('email'), 
            data.get('address'), 
            data.get('admin')] or\
  (data.get('email') == '' or\
   data.get('address') == '' or\
   data.get('admin') == ''):                           # If missing data
    return json.dumps(
      {"error": "Missing information."}), 403            # Return error
      
  users = User.query().fetch()                         # Get all users
  for entity in users:                                 # For each user
    if entity.email == data.get('email'):                # If emails match
      return json.dumps(
        {"error": "Email already registered."}), 403       # Return error
    if entity.address == data.get('address').upper():    # If addresses match
      return json.dumps(
        {"error": "Account already exists."}), 403         # Return error

  token = createRegistrationToken(
      data.get('address'), data.get('admin'))          # Create token
  url = "https://mygarage.appspot.com/register?"+\
  "token="+token                                       # Create url

  mail.send_mail(
    sender="MyGarage Admin <kraftme@oregonstate.edu>",
    to=data.get('email'),
    subject="MyGarage Invitation",
    body="Hello resident @ " + data.get('address').upper()+\
      ",\n\nWelcome to the neighborhood! We'd like"+\
      " to invite you to register your vehicle(s) "+\
      "with our MyGarage system. This will allow our"+\
      " community gate to recognize your vehicle(s)"+\
      " and open automatically. Please register soon"+\
      " as this link will expire in 3 days.\n\n"+url+\
      "\n\nIf this message has been received in error"+\
      ", please disregard.\n\n"+\
      "Sincerely,\nYour MyGarage Admin")                # Send registration email

  return json.dumps(
    {"msg": "A link has been sent to the resident's"+\
     " email to register their account."}), 200         # Return message
  
#-------------------------------------------------------------------------------
# Details: contactUs() allows any user to send a message to the MyGarage help
#          team. These messages are not saved in the datastore as we do not
#          manage a mail server. The message is sent to the customer service
#          agent's official email, and the user must provide an email for us
#          to send a response to.
# Called From: https://mygarage.appspot.com/contactus
# Params: access token (str), userID (int), message [name (str), email (str),
#         message (str)]
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>/contactus', methods=['POST'])
def contactUs(userID):
  access_token = request.headers.get('Authorization')     # Get token
  
  verification = verifyUserToken(access_token)            # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                             # If not access token
    return verification                                     # Return error res

  if int(verification) != userID:                         # If IDs don't match
    return json.dumps(
        {"error": "You don't own this account."}), 403      # Return error

  data = request.get_json()                               # Get json

  if None in [data.get('name'), 
  data.get('email'), data.get('message')] or\
  (data.get('name') == '' or\
  data.get('email') == '' or\
  data.get('message') == ''):                             # If missing data
    return json.dumps(
        {"error": "Missing information."}), 403             # Return error
      
  user = User.get_by_id(userID)                           # Get user
  
  mail.send_mail(
    sender="MyGarage Contact Form <kraftme@oregonstate.edu>",
    to="Customer Service <kraftme@oregonstate.edu>,"+\
    "Customer Service <shielcon@oregonstate.edu>,"+\
    "Customer Service <choit@oregonstate.edu>",
    subject=user.address,
    body="From: "+data.get('name')+" "+\
    data.get('email')+"\n\n"+\
    data.get('message'))                                  # Send email

  return json.dumps(
    {"msg": "Your email has been sent."+\
     " Our customer service representative"+\
     " will respond shortly."}), 200                      # Return message
         
#-------------------------------------------------------------------------------
# Details: sendMessage() allows an admin to email every registered MyGarage
#          user, as well ass creates a usr-msg relationship for the message
#          and every user in the datastore.
# Called From: https://mygarage.appspot.com/messages
# Params: access token (str), message [subject, message] (json)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/messages', methods=['POST'])
def sendMessage():
  access_token = request.headers.get('Authorization')   # Get token
  
  verification = verifyAdminToken(access_token)         # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                           # If not admin token
    return verification                                   # Return error res

  data = request.get_json()                             # Get json

  if None in [data.get('subject'), 
  data.get('message')] or\
  (data.get('subject') == '' or\
  data.get('message') == ''):                           # If missing data
    return json.dumps(
        {"error": "Missing information."}), 403           # Return error
      
  newMsg = Message(subject=data.get('subject'),
       message=data.get('message'),
       timestamp=datetime.datetime.now())               # Create message object

  msgID = newMsg.put()                                  # Add to datastore
      
  users = User.query().fetch()                          # Get all users
  for entity in users:                                  # For each user
    newUsrMsg = UserMessage(userID=entity.key.id(),
                          messageID=msgID.id(),
                          unread=True)                    # Create usr-msg relationship
    newUsrMsg.put()                                       # Add to datastore
  
    mail.send_mail(
      sender="MyGarage Admin <kraftme@oregonstate.edu>",
      to=entity.email,
      subject=data.get('subject'),
      body=data.get('message'))                           # Send email

  return json.dumps(
    {"msg": "Your email has been sent"+\
     " to all MyGarage users."}), 200                   # Return message
     
#-------------------------------------------------------------------------------
# Details: getUserMessages() returns all messages registered with the user.
# Called From: https://mygarage.appspot.com/messages
# Params: access token (str), userID (int)
# Returns: array of Message entities (json)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>/messages', methods=['GET'])
def getUserMessages(userID):
  access_token = request.headers.get('Authorization')  # Get token
  
  verification = verifyUserToken(access_token)         # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                          # If not access token
    return verification                                  # Return error res

  if int(verification) != userID:                      # If IDs don't match
    return json.dumps(
      {"error": "You don't own these messages"}), 401    # Return error
      
  usrMsg = UserMessage.query()\
  .filter(UserMessage.userID == userID)                # Get usr-msg relationships
  
  messages = []
  for entity in usrMsg:                                # For each relationship
    msg = Message.get_by_id(entity.messageID)            # Get message
    messages.append({"subject": msg.subject,
        "message": msg.message,
        "unread": entity.unread,
        "timestamp": msg.timestamp,
        "id": entity.messageID})                     # Add data to array
      
  return jsonify(messages), 200                        # Return array
         
#-------------------------------------------------------------------------------
# Details: readMessage() changes a user-message relationship from unread to
#          read.
# Called From: https://mygarage.appspot.com/messages
# Params: access token (str), userID (int), messageID (int)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>/messages/<int:messageID>', methods=['PUT'])
def readMessage(userID, messageID):
  access_token = request.headers.get('Authorization')   # Get token
  
  verification = verifyUserToken(access_token)          # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                           # If not access token
    return verification                                   # Return error res

  if int(verification) != userID:                       # If IDs don't match
    return json.dumps(
      {"error": "You don't own this message"}), 401       # Return error
      
  usrMsg = UserMessage.query()\
  .filter(ndb.AND(UserMessage.userID == userID, 
                  UserMessage.messageID == messageID))  # Get usr-msg relationship
  for entity in usrMsg:                                 # For each relationship
    entity.unread = False                                 # Set unread status
    entity.put()                                          # Update in datastore
      
  return json.dumps(
    {"msg": "Your message has been read"}), 200         # Return message
    
#-------------------------------------------------------------------------------
# Details: deleteMessage() removes a user-to-message relationship from the 
#          datastore, specified by the userID and messageID in the request
#          url.
# Called From: https://mygarage.appspot.com/messages
# Params: access token (str), userID (int), messageID (int)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>/messages/<int:messageID>', methods=['DELETE'])
def deleteMessage(userID, messageID):
  data = request.get_json()
  
  if None in [data.get('Authorization')] or\
  data.get('Authorization') == '':                      # If missing token
    return json.dumps(
        {"error": "No access token."}), 403                # Return error
  
  access_token = data.get('Authorization')               # Get token
  
  verification = verifyUserToken(access_token)           # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                            # If not access token
    return verification                                    # Return error msg

  if int(verification) != userID:                        # If IDs don't match
    return json.dumps(
      {"error": "You don't own this message"}), 401        # Return error
      
  usrMsg = UserMessage.query()\
  .filter(ndb.AND(UserMessage.userID == userID, 
                  UserMessage.messageID == messageID))   # Get usr-msg relationship
  for entity in usrMsg:                                  # For each relationship
     ndb.Key(UserMessage, entity.key.id()).delete()        # Delete from datastore
      
  return json.dumps(
    {"msg": "Your message has been deleted"}), 200       # Return message
        
#-------------------------------------------------------------------------------
# Details: createAccount() allows a user to register their own account after
#          having been invited by an admin.
# Called From: https://mygarage.appspot.com/register
# Params: registration token (str), user [email, username, password, 
#         phone] (json)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/users', methods=['POST'])
def createAccount():
  data = request.get_json()                            # Get json

  if None in [data.get('email'), 
  data.get('username'), data.get('password'),
  data.get('token')] or\
  data.get('email') == '' or\
  data.get('username') =='' or\
  data.get('password') == '' or\
  data.get('token') == '':                             # If missing data
    return json.dumps(
      {"error": "Missing information."}), 403            # Return error
        
  access_token = data.get('token')                     # Get token
  
  found = checkBlacklist(access_token)                 # Check blacklist
  if found:                                            # If found
    return json.dumps(
        {"error": "Token blacklisted."}), 401            # Return error
        
  res = checkJWT(access_token)                         # Validate

  if isinstance(res, basestring):                      # If not registration token
    return json.dumps(
      {"error": "Not a registration token."}), 401       # Return error
  
  users = User.query().fetch()                         # Get all users
  for entity in users:                                 # For each user
    if entity.username == data.get('username'):          # If usernames match
      return json.dumps(
        {"error": "Username already exists."}), 403        # Return error
    if entity.email == data.get('email').lower():        # If emails match
      return json.dumps(
        {"error": "Email already registered."}), 403       # Return error
    if entity.address == res['addr'].upper():            # If addresses match
      return json.dumps(
        {"error": "Account already exists."}), 403         # Return error
        
  s = random_generator(10)                             # Create salt
  p = createHash(data.get('password'), s)              # Create hash
  
  phone = None
  if data.get('phone') is not None:
    phone = int(data.get('phone'))
        
  newUser = User(username=data.get('username'),
                email=data.get('email').lower(),
                salt=s,
                password=p,
                address=res['addr'].upper(),
                phone=phone,
                admin=res['admin'],
                master_admin=False,
                last_login=None)                       # Create User object
  newUser.put()                                        # Save to datastore
  
  newBlacklist = Blacklist(token=access_token,
                timestamp=datetime.datetime.now())     # Blacklist token
  newBlacklist.put()                                   # Save to datastore
  
  return json.dumps(
        {"msg": "Account created."}), 201              # Return message
        
#-------------------------------------------------------------------------------
# Details: deleteUser() allows admins to delete user accounts. Only an admin 
#          can delete a user account, and only the master admin can delete an 
#          admin account.
# Called From: https://mygarage.appspot.com/community
# Params: access token (str), userID (int)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>', methods=['DELETE'])
def deleteUser(userID):
  data = request.get_json()                             # Get token
  access_token = data.get('Authorization')
  
  verification = verifyAdminToken(access_token)         # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                           # If not admin token
    return verification                                   # Return error res

  user = User.get_by_id(int(verification))              # Get user
  user.to_dict()
  
  account = User.get_by_id(userID)                      # Get account 
  if account is None:                                   # If none
    return json.dumps(
      {"error": "User account not found."}), 404          # Return error
                                  
  if account.admin == True and\
   user.master_admin == False:                          # If admin account
                                                        # but not master user
    return json.dumps(
      {"error": "You cannot delete an admin."}), 404      # Return error
      
  if account.master_admin == True:                      # If master account              
    return json.dumps(
      {"error": "Cannot delete master admin."}), 404      # Return error

  vehicles = Vehicle.query()\
  .filter(Vehicle.userID == userID)                     # Get user's vehicles
  for entity in vehicles:                               # For each vehicle
    entries = Entry.query()\
    .filter(Entry.vehicleID == entity.key.id())           # Get entries
    for entry in entries:                                 # For each entry
      ndb.Key(Entry, entry.key.id()).delete()               # Delete entry
      
    ndb.Key(Vehicle, entity.key.id()).delete()            # Delete vehicle

  ndb.Key(User, userID).delete()                        # Delete account

  return json.dumps(
    {"msg": "User and their vehicles deleted."}), 200   # Return message
                
#-------------------------------------------------------------------------------
# Details: getProfile() returns the profile information of the currently 
#          logged in user.
# Called From: https://mygaraage.appspot.com/account
# Params: access token (str)
# Returns: User entity (json)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>', methods=['GET'])
def getProfile(userID):    
  access_token = request.headers.get('Authorization')   # Get token
  
  verification = verifyUserToken(access_token)          # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                           # If not access token
    return verification

  if int(verification) != userID:                       # If IDs don't match
    return json.dumps(
      {"error": "You don't own this profile."}), 404      # Return error

  user = User.get_by_id(userID)                         # Get user
  
  ll = None
  if user.last_login:                                   # If has last login
    ll = user.last_login\
      .strftime("%m/%d/%Y, %H:%M:%S")                     # Format date
      
  obj = {
    "id": user.key.id(),
    "username": user.username,
    "email": user.email,
    "address": user.address,
    "phone": user.phone,
    "admin": user.admin,
    "last_login": ll
  }                                                     # Select data
  return jsonify(obj)                                   # Return as json
        
#-------------------------------------------------------------------------------
# Details: updateProfile() allows users to change their own email address, 
#          phone number, and/or password. Admins can also use this request
#          to update another user's admin status.
# Called From: https://mygarage.appspot.com/account or 
#              https://mygarage.appspot.com/community
# Params: access token header, userID (int), 
#         user [email, phone, old password, new password, admin]
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>', methods=['PUT'])
def updateProfile(userID):
  access_token = request.headers.get('Authorization')     # Get token
  
  verification = verifyUserToken(access_token)            # verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                             # If not access token
    return verification                                     # Return error res

  user = User.get_by_id(int(verification))                # Get user
  if int(verification) != userID and\
  user.admin == False:                                    # If not editing own profile, 
                                                          # and not an admin
    return json.dumps({ 
      "error": "You don't own this profile,"+\
      "and you're not an admin."}), 404                     # Return error
  
  data = request.get_json()                               # Get json data
  account = User.get_by_id(userID)                        # Get account
  
  if int(verification) == userID:                         # If editing own account
    if data.get('email'):                                   # If email provided
      emails = User.query()                                   # Get all emails
      for entity in emails:                                   # For each email
        if entity.email == data.get('email') and\
        entity.key.id() != int(verification):                   # If email belongs to other user
          return json.dumps({ 
            "error": "Email already exists."}), 404               # Return error
            
        account.email = data.get('email')                       # Else, update email
                
    if data.get('phone'):                                   # If phone provided
      account.phone = int(data.get('phone'))                  # Update phone
                
    if data.get('new_password') and\
      data.get('old_password'):                             # If new & old pass provided
      s = getSalt(account.email)                              # Get user's salt
      hash = createHash(data.get('old_password'), s)          # Create old pass hash
      verified = verifyLogin(account.email, hash)             # Verify hashes
         
      if verified:                                            # If they match
        account.salt = random_generator(10)                     # Create new salt
        account.password = createHash(data  
          .get('new_password'), account.salt)                   # Create new hash
      else:                                                   # Else
        return json.dumps(
          {"error": "Old Password is incorrect."}), 404         # Return error
          
  elif user.admin == True:                                 # If not editing own account,
                                                           # and is an admin
    if account.master_admin == True:                         # If account is master admin
      return json.dumps(
      {"error": "Cannot change master"+\
       " admin's status."}), 400                               # Return error message 
    else:                                                    # Else
      account.admin = data.get('admin')                        # Update account admin status
  else:                                                    # Else
    return json.dumps(
      {"error": "Something's wrong."+\
       " Check PUT /users."}), 400                           # Return message
            
  account.put()                                            # Save changes
  return json.dumps(
    {"msg": "User updated."}), 201                         # Return message

#-------------------------------------------------------------------------------
# Details: registerVehicle() allows a user to create new vehicle entities
#          associated with their account.
# Called From: https://mygarage.appspot.com/vehicles
# Params: access token (str), vehicle [plate_number, state, guest, type, 
#         color] (json)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>/vehicles', methods=['POST'])
def registerVehicle(userID):
  access_token = request.headers.get('Authorization')       # Get token
  
  verification = verifyUserToken(access_token)              # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                               # If not access token
    return verification                                       # Return error res

  if int(verification) != userID:                           # If IDs don't match
    return json.dumps(
      {"error": "You don't own this profile,"+\
      " so you can't create a vehicle for it."}), 404         # Return error

  data = request.get_json()                                 # Get json

  if None in [data.get('plate_number'), 
  data.get('state'), data.get('guest')] or\
  data.get('plate_number') == '' or\
  data.get('state') == '' or\
  data.get('guest') == '':                                  # If missing data
    return json.dumps(
      {"error": "Missing information."}), 403                 # Return error
  
  vehicles = Vehicle.query()                                # Get all vehicles
  for entity in vehicles:                                   # For each vehicle
    if entity.plate_number == data.get('plate_number')\
    .upper():                                                 # If plates match
      return json.dumps(
        {"error": "Plate is already registered."}), 403         # Return error
      
  type = None  
  if data.get('type') is not None and \
  data.get('type') != '':                                   # If type provided
      type = data.get('type').lower()                         # Record type
      
  color = None  
  if data.get('color') is not None and \
  data.get('color') != '':                                  # If color provided
      color = data.get('color').lower()                       # Record color
        
  exp = None
  if data.get('guest') == True:                             # If guest is true
    exp = datetime.datetime.now() + timedelta(days=365)       # Set exp date
        
  newUser = Vehicle(
            plate_number=data.get('plate_number').upper(),
            state=data.get('state').upper(),
            guest=data.get('guest'),
            userID=userID,
            color=color,
            type=type,
            blocked=False,
            entryID=None,
            expiration_date=exp)                            # Create object
  
  newUser.put()                                             # Save to datastore
  return json.dumps(
      {"msg": "Vehicle registered."}), 201                  # Return message
      
#-------------------------------------------------------------------------------
# Details: getUserVehicles() returns the user's entire list of vehicles.
# Called From: https://mygarage.appspot.com/vehicles
# Params: access token (str), userID (int)
# Returns: array of Vehicle entities (json)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>/vehicles', methods=['GET'])
def getUserVehicles(userID):
  access_token = request.headers.get('Authorization')   # Get token
    
  verification = verifyUserToken(access_token)          # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                           # If not access token
    return verification                                   # Return error res

  if int(verification) != userID:                       # If IDs don't match
    return json.dumps(
      {"error": "You don't own this profile,"+\
      " so you can't view its vehicles."}), 404           # Return error
      
  user = User.get_by_id(int(verification))
  
  vehicles = None
  if user.admin == True:                                # If user is admin
    vehicles = Vehicle.query()                            # Get all vehicles
  else:                                                 # Else
    vehicles = Vehicle.query()\
    .filter(Vehicle.userID == userID)                     # Get user's vehicles
    
  data = []
  for entity in vehicles:                               # For each vehicle
    u = User.get_by_id(entity.userID)
    address = u.address
      
    ent = None
    if entity.entryID is not None:                        # If has entryID
      entry = Entry.get_by_id(entity.entryID)               # Get entry
      entry.to_dict()                                       
      ent = entry.timestamp\
      .strftime("%m/%d/%Y, %H:%M:%S")                       # Format date
      
    exp = None
    if entity.expiration_date is not None:                # If has exp date
      exp = entity.expiration_date\
      .strftime("%m/%d/%Y, %H:%M:%S")                       # Format date
  
    obj = {
      "id": entity.key.id(),
      "address": address,
      "plate_number": entity.plate_number,
      "state": entity.state,
      "color": entity.color,
      "type": entity.type,
      "guest": entity.guest,
      "blocked": entity.blocked,
      "last_entry": ent,
      "expiration_date": exp
    }                                                     # Select data
    data.append(obj)                                      # Add to array
     
  return jsonify(data), 200                             # Return array

#-------------------------------------------------------------------------------
# Details: updateVehicle() allows users to change the plate number, state, 
#          guest status, and blocked status of one of their vehicles. Admins 
#          are also able to un/block any guest vehicles in the datastore.
# Called From: https://mygarage.appspot.com/vehicles,
#              https://mygarage.appspot.com/community
# Params: access token (str), userID (int), vehicleID (int), 
#         vehicle [plate_number, state, guest, blocked] (json)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>/vehicles/<int:vehicleID>', methods=['PUT'])
def updateVehicle(userID, vehicleID):
  access_token = request.headers.get('Authorization')     # Get token
  
  verification = verifyUserToken(access_token)            # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                             # If not access token
    return verification                                     # Return error

  data = request.get_json()                               # Get json data

  vehicle = Vehicle.get_by_id(vehicleID)                  # Get vehicle
  
  if vehicle is None:                                     # If not found
    return json.dumps({ 
      "error": "Vehicle not found."}), 404                  # Return error
      
  user = User.get_by_id(int(verification))                # Get user
  
  if (vehicle.userID != user.key.id() and\
  user.admin == False):                                   # If not authorized
    return json.dumps({ 
    "error": "You don't own this account,"+\
    " and you're not an admin"}), 403                       # Return error
    
  if (vehicle.userID != user.key.id() and\
      user.admin == True and vehicle.guest == False):     # If not authorized
    return json.dumps({ 
    "error": "Admins can only un/block guests"+\
    " of another user's account."}), 403                    # Return error
        
  if vehicle.userID == user.key.id():
    if data.get('plate_number') is not None:              # If plate provided
      vehicle.plate_number = data.get('plate_number')\
      .upper()                                              # Update plate
            
    if data.get('state') is not None:                     # If state provided
      vehicle.state = data.get('state').upper()             # Update state
   
    if data.get('guest') is not None:                     # If guest provided
      vehicle.guest = data.get('guest')                     # Update guest
    
  if data.get('blocked') is not None:                     # If blocked provided
    vehicle.blocked = data.get('blocked')                   # Update blocked         
            
  vehicle.put()                                           # Save changes
  return json.dumps(
    {"msg": "Vehicle updated."}), 201                     # Return message
        
#-------------------------------------------------------------------------------
# Details: deleteVehicle() deletes a vehicle object from the datastore by the
#          id provided in the url.
# Called From: https://mygarage.appspot.com/vehicles
# Params: access token (str), userID (int), vehicleID (int)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/users/<int:userID>/vehicles/<int:vehicleID>', methods=['DELETE'])
def deleteVehicle(userID, vehicleID):
  access_token = request.headers.get('Authorization')    # Get token
  
  verification = verifyUserToken(access_token)           # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                            # If not access token
    return verification                                    # Return error res

  if int(verification) != userID:                        # If IDs don't match
    return json.dumps(
      {"error": "You don't own this profile,"+\
      " so you can't delete this vehicle."}), 404          # Return error

  vehicle = Vehicle.get_by_id(vehicleID)                 # Get vehicle
  
  if vehicle is None:                                    # If not found
    return json.dumps({ 
      "error": "Vehicle not found."}), 404                 # Return error
      
  if vehicle.userID != userID:                           # If IDs don't match
    return json.dumps({ 
      "error": "Account doesn't"+\
      " own this vehicle."}), 404                          # Return error   
      
  entries = Entry.query()\
  .filter(Entry.vehicleID == vehicleID)                  # Get vehicle's entries
  for entry in entries:                                  # For each entry
    ndb.Key(Entry, entry.key.id()).delete()                # Delete
                             
  ndb.Key(Vehicle, vehicleID).delete()                   # Delete vehicle
  return json.dumps(
    {"msg": "Vehicle deleted."}), 200                    # Return message
          
#-------------------------------------------------------------------------------
# Details: getEntries() returns the entire list of entry records, only if the 
#          requester is an admin.
# Called From: https://mygarage.appspot.com/activity
# Params: admin access token (str)
# Returns: array of Entry entities (json)
#-------------------------------------------------------------------------------
@app.route('/entries', methods=['GET'])
def getEntries():
  access_token = request.headers.get('Authorization')   # Get token
    
  verification = verifyUserToken(access_token)         # Verify token
  
  if not isinstance(verification, basestring) or\
  not verification.isdigit():                           # If verif is false
    return verification                                   # Return error res

  user = User.get_by_id(int(verification))
  
  entries = Entry.query()                               # Get all entries
  if user.admin == False:                               # If user isn't admin
    ents = []
    vehicles = Vehicle.query()\
    .filter(Vehicle.userID == int(verification))          # Get all vehicles
    
    for entry in entries:                                 # For each entry
      if entry.vehicleID is not None:                       # If has vehicleID
        for vehicle in vehicles:                              # Check user's vehicle
          if entry.vehicleID == vehicle.key.id():               # If IDs match
            ents.append(entry)                                    # Add to array
    entries = ents
      
    
  data = []
  for entity in entries:                                # For each vehicle
    if entity.vehicleID is None:                          # If no vehicleID
      obj = {
        "id": entity.key.id(),
        "address": None,
        "plate_number": entity.plate_number,
        "state": entity.state,
        "color": entity.color,
        "type": entity.type,
        "guest": None,
        "denied": entity.denied,
        "timestamp": entity.timestamp\
        .strftime("%m/%d/%Y, %H:%M:%S")
      }                                                     # Select data   
    else:                                                 # Else
      v = Vehicle.get_by_id(int(entity.vehicleID))          # Get vehicle by id
      
      p = s = c = t = g = a = ""
      if v is not None:
        p = v.plate_number
        s = v.state
        c = v.color
        t = v.type
        g = v.guest
  
        u = User.get_by_id(int(v.userID))                   # Get user by id  
        a = u.address                                    
  
      obj = {
        "id": entity.key.id(),
        "address": a,
        "plate_number": p,
        "state": s,
        "color": c,
        "type": t,
        "guest": g,
        "denied": entity.denied,
        "timestamp": entity.timestamp\
        .strftime("%m/%d/%Y, %H:%M:%S")
      }                                                     # Select data
    data.append(obj)                                      # Add to array
  return jsonify(data), 200                             # Return array
  
#-------------------------------------------------------------------------------
# Details: pullVehicleData() returns the entire list of vehicles, only if the 
#          requester is the RPi.
# Called From: sync_engine.py - pullData()
# Params: RPi secret (str)
# Returns: array of Vehicle entities (json)
#-------------------------------------------------------------------------------
@app.route('/data', methods=['GET'])
def pullVehicleData():
  data = request.headers.get('secret')
  
  if data is None or data != 'RPI':                     # If no secret
      return json.dumps(
        {"error": "Unauthorized access."}), 403           # Return error
  
  vehicles = Vehicle.query()                            # Get all vehicles
  data = []
  for entity in vehicles:                               # For each vehicle
    exp = None
    if entity.expiration_date is not None:
      exp = entity.expiration_date\
      .strftime("%m/%d/%Y, %H:%M:%S")
  
    obj = {
      "id": entity.key.id(),
      "plate_number": entity.plate_number,
      "state": entity.state,
      "color": entity.color,
      "type": entity.type,
      "blocked": entity.blocked,
      "expiration_date": exp
    }                                                     # Select data
    data.append(obj)                                      # Add to array
  return jsonify(data), 200                             # Return array
  
#-------------------------------------------------------------------------------
# Details: recordEntry() takes json data sent by the RPI, confirms the data was 
#          sent from the RPI, and creates an Entry object to save to the 
#          datastore. This serves as a record for a vehicle having been granted 
#          or denied access to the community.
# Called From: image_processor.py - recordEntry()
# Params: RPI secret (str), 
#         vehicleID (int), 
#         plate_number (str), 
#         state (str), 
#         color (str), 
#         type (str), 
#         denied (bool)
# Returns: status code and message (str)
#-------------------------------------------------------------------------------
@app.route('/entries', methods=['POST'])
def recordEntry():
  data = request.get_json()                            # Get json
  
  if None in [data.get('secret'), 
  data.get('denied')]:                                 # If missing data
    return json.dumps(
      {"error": "Missing information."}), 403            # Return error
        
  if data.get('secret') != 'RPI':                      # If not sent from RPI
    return json.dumps(
      {"error": "Access denied."}), 403                  # Return error
      
  vehicleID = None  
  if data.get('vehicleID') is not None and \
  data.get('vehicleID') != '':                         # If contains vehicleID
      vehicleID = data.get('vehicleID')                  # Get vehicleID
      
  plate_number = None  
  if data.get('plate_number') is not None and \
  data.get('plate_number') != '':                      # If contains plate num
      plate_number = data.get('plate_number').upper()    # Get plate number
      
  state = None  
  if data.get('state') is not None and \
  data.get('state') != '':                             # If contains state
      state = data.get('state').upper()                  # Get state
      
  color = None  
  if data.get('color') is not None and \
  data.get('color') != '':                             # If contains color
      color = data.get('color').lower()                  # Get color
      
  type = None  
  if data.get('type') is not None and \
  data.get('type') != '':                              # If contains type
      type = data.get('type').lower()                    # Get type
        
  newEntry = Entry(vehicleID=vehicleID,
                   plate_number=plate_number,
                   state=state,
                   color=color,
                   type=type,
                   denied=data.get('denied'),
                   timestamp=datetime.datetime.now())  # Create Entry object
  
  ent_key = newEntry.put()                             # Save to datastore
  
  if vehicleID is not None:                            # If contains vehicleID
    vehicle = Vehicle.get_by_id(vehicleID)               # Get vehicle object
    vehicle.entryID = ent_key.id()                       # Update entryID
    vehicle.put()

  return json.dumps(
      {"msg": "Entry recorded."}), 201                 # Return message
      
#-------------------------------------------------------------------------------
# Details: findVehicle() takes license plate derived from the image processing
#          program and searches the datastore for a match. If a match is found,
#          request returns True. If not, it returns False.
# Called From: image_processor.py - searchDatastore()
# Params: RPI secret (str), 
#         plate_number (str)
# Returns: True / False (bool), vehicleID (int)
#-------------------------------------------------------------------------------
@app.route('/gate', methods=['POST'])
def findVehicle():
  data = request.get_json()                            # Get json
  
  if None in [data.get('secret'), 
  data.get('plate_number')] or\
  data.get('secret') == '' or\
  data.get('plate_number') == '':                      # If missing data
    return json.dumps(
      {"error": "Missing information."}), 403            # Return error
        
  if data.get('secret') != 'RPI':                      # If not sent by RPI
    return json.dumps(
      {"error": "Access denied."}), 403                  # Return error

  query = Vehicle.query()\
    .filter(Vehicle.plate_number == str(
    data.get('plate_number')))
  vehicle = query.get()                                # Get vehicle
  
  if vehicle is None:                                  # If vehicle not found
    return json.dumps(
      {"found": False, "vehicleID": None}), 401          # Return false
  else:                                                # Else
    return json.dumps(
      {"found": True, 
       "vehicleID": vehicle.key.id()}), 200              # Return true                                          

#---------------------------- End Controller Functions -------------------------


