from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskReorderView

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path('reorder/', TaskReorderView.as_view(), name='task-reorder'),
]
