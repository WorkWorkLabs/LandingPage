<template>
  <BaseCard
    variant="elevated"
    padding="md"
    rounded="lg"
    hoverable
    class="team-member-card"
  >
    <div class="member-content text-left">
      <div class="member-info">
        <div class="member-avatar">
          <img
            v-if="member.avatar"
            :src="member.avatar"
            :alt="member.name"
            class="avatar-image"
            @error="onImageError"
          />
          <div v-else class="avatar-placeholder">
            {{ getInitials(member.name) }}
          </div>
        </div>

        <h3 class="member-name">{{ member.name }}</h3>
        <p class="member-title">{{ member.title }}</p>
      </div>

      <div
        v-if="member.social && member.social.length > 0"
        class="member-social"
      >
        <a
          v-for="social in member.social"
          :key="social.platform"
          :href="social.url"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
        >
          <svg
            v-if="social.platform === 'x' || social.platform === 'twitter'"
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            />
          </svg>
          <svg
            v-else-if="social.platform === 'github'"
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          <svg
            v-else-if="social.platform === 'linkedin'"
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
          </svg>
        </a>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from "@/components/base/BaseCard.vue";
import type { TeamMember } from "@/types";

interface Props {
  member: TeamMember;
}

const props = defineProps<Props>();

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const onImageError = (event: Event) => {
  // Hide broken image and show placeholder instead
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
};
</script>

<style scoped>
.team-member-card {
  @apply transition-all duration-300;
  background: transparent !important;
  box-shadow: none !important;
  height: 300px !important; /* 强制固定卡片高度 */
  min-height: 300px !important;
  max-height: 300px !important;
  padding: 0 !important; /* 移除BaseCard的默认padding */
  margin: 0 !important; /* 确保没有外边距 */
}

.member-content {
  @apply relative;
  height: 100%; /* 填满卡片高度 */
  padding: 16px; /* 添加内边距替代BaseCard的padding */
  box-sizing: border-box; /* 确保padding计算在高度内 */
}

.member-info {
  @apply space-y-4;
  padding-bottom: 40px; /* 给社交链接留出空间 */
}

.member-avatar {
  @apply mb-4;
}

.avatar-image {
  @apply w-16 h-16 rounded object-cover;
}

.avatar-placeholder {
  @apply w-16 h-16 bg-primary text-white rounded flex items-center justify-center text-lg font-bold;
}

.member-name {
  @apply text-lg font-bold text-gray-900;
}

.member-title {
  @apply text-sm text-gray-600 leading-relaxed;
  display: -webkit-box;
  -webkit-line-clamp: 4; /* 增加到4行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 80px; /* 增加高度以容纳4行文字 */
  line-height: 1.4;
}

.member-social {
  @apply flex justify-start space-x-3;
  position: absolute;
  bottom: 0;
  left: 16px; /* 与头像左边缘对齐（等于member-content的padding） */
  background-color: #28afff; /* 蓝色背景 */
  padding: 8px 16px; /* 固定上下padding */
  border-radius: 20px; /* 只有顶部圆角，底部贴边 */
  backdrop-filter: blur(4px); /* 毛玻璃效果 */
  height: 30px; /* 固定高度 */
  align-items: center; /* 图标垂直居中 */
  margin: 0;
}

.social-link {
  @apply text-white hover:text-gray-300 transition-colors; /* 白色图标 */
}

.bg-primary {
  background-color: #00a1ff;
}

.hover\:text-primary:hover {
  color: #00a1ff;
}
</style>
