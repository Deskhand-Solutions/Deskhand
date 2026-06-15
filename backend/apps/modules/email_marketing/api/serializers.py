from rest_framework import serializers

from apps.modules.email_marketing.models import EmailProject


class EmailImageAssetSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False)
    alt_text = serializers.CharField(max_length=200, required=False, allow_blank=True)
    data_url = serializers.CharField()


class EmailProjectSerializer(serializers.ModelSerializer):
    image_assets = EmailImageAssetSerializer(many=True, required=False)

    class Meta:
        model = EmailProject
        fields = [
            "id",
            "title",
            "subject_line",
            "context",
            "style_guidelines",
            "html_content",
            "image_assets",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]


class EmailProjectCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    context = serializers.CharField(required=False, allow_blank=True)
    style_guidelines = serializers.CharField(required=False, allow_blank=True)
    subject_line = serializers.CharField(required=False, allow_blank=True, max_length=998)
    image_assets = EmailImageAssetSerializer(many=True, required=False)


class EmailProjectUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False)
    context = serializers.CharField(required=False, allow_blank=True)
    style_guidelines = serializers.CharField(required=False, allow_blank=True)
    subject_line = serializers.CharField(required=False, allow_blank=True, max_length=998)
    html_content = serializers.CharField(required=False, allow_blank=True)
    image_assets = EmailImageAssetSerializer(many=True, required=False)
