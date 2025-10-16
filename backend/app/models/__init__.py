from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

from .auth_models import *
try:
	from .driver_models import *
except Exception:
	# Fallback to old CamelCase module if present
	try:
		from .DriverModels import *
	except Exception:
		pass
try:
	from .roles_models import *
except Exception:
	pass