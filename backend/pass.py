import bcrypt

password = "invest1234"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode())  # لاحظ: نحولها لنص عشان نخزنها في MongoDB
