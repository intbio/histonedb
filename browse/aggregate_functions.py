from django.db import models

class GroupConcat(models.Aggregate):
    function = 'GROUP_CONCAT'
    template = '%(function)s(DISTINCT %(expressions)s%(separator)s)'

    def __init__(self, expression, distinct=False, separator=None, **extra):
        super(GroupConcat, self).__init__(
            expression,
            # distinct='DISTINCT ' if distinct else '',
            separator= f" SEPARATOR '{separator}'" if separator else '',
            output_field=models.CharField(),
            **extra)