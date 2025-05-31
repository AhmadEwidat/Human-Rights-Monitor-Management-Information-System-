from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

# تعريف مخطط OAuth2 للتوكن
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# دالة للتحقق من توكن الإداري
async def get_admin_token(token: str = Depends(oauth2_scheme)):
    # هنا يمكنك إضافة منطق التحقق من التوكن
    # هذا مثال بسيط، يجب استبداله بمنطق حقيقي (مثل التحقق من JWT)
    if token != "admin-token-example":
        raise HTTPException(status_code=403, detail="Invalid admin token")
    return token