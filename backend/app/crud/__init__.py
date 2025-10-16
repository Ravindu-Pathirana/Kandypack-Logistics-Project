try:
	from .driver_crud import *
	from . import driver_crud as driver_crud
except Exception:
	try:
		from .DriverCrud import *
		from . import DriverCrud as driver_crud
	except Exception:
		pass

from .auth_crud import *
from . import auth_crud as auth_crud