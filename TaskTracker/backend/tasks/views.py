from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Assign the task to the logged-in user
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

class TaskReorderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        task_ids = request.data.get('order', [])
        for index, task_id in enumerate(task_ids):
            try:
                task = Task.objects.get(id=task_id, user=request.user)
                task.position = index
                task.save()
            except Task.DoesNotExist:
                continue
        return Response({'message': 'Order updated'}, status=status.HTTP_200_OK)
