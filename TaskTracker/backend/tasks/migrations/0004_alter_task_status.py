# Generated by Django 5.2 on 2025-07-15 19:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0003_alter_task_options_rename_order_task_position_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='status',
            field=models.CharField(choices=[('Incomplete', 'Incomplete'), ('Upcoming', 'Upcoming'), ('Completed', 'Completed')], max_length=20),
        ),
    ]
