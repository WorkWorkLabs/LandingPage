<script setup lang="ts">
import AppLogo from './AppLogo.vue'
</script>

<template>
  <footer id="footer" class="border-t border-black/6 bg-[#F7F9FB]">
    <div class="ww-shell py-14 sm:py-16">
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div class="sm:col-span-2 lg:col-span-1">
          <AppLogo />
          <p class="mt-4 text-sm leading-relaxed text-[#595959]">
            构建全球远程工作生态系统，为数字游民、OPC 一人公司与远程工作者提供轻量但完整的工作流。
          </p>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-[#1A1A1A]">内容频道</h4>
          <ul class="mt-4 space-y-3">
            <li>
              <a href="#articles" class="text-sm text-[#595959] transition-colors hover:text-[#48A9DE]">精选文章</a>
            </li>
            <li>
              <a href="#toolbox" class="text-sm text-[#595959] transition-colors hover:text-[#48A9DE]">工具箱</a>
            </li>
            <li>
              <a href="#nomad-guide" class="text-sm text-[#595959] transition-colors hover:text-[#48A9DE]">漫游指南</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-[#1A1A1A]">WorkWork</h4>
          <ul class="mt-4 space-y-3">
            <li>
              <a href="#about" class="text-sm text-[#595959] transition-colors hover:text-[#48A9DE]">关于产品</a>
            </li>
            <li>
              <a href="#articles" class="text-sm text-[#595959] transition-colors hover:text-[#48A9DE]">远程工作</a>
            </li>
            <li>
              <a href="mailto:press@workwork.io" class="text-sm text-[#595959] transition-colors hover:text-[#48A9DE]">媒体联络</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-[#1A1A1A]">关注我们</h4>
          <div class="mt-4 flex gap-3">
            <a
              href="https://x.com/WorkWorkOrg"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/6 text-[#595959] transition-all hover:border-[#48A9DE]/30 hover:text-[#48A9DE]"
              aria-label="Twitter"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://github.com/WorkWorkLabs"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/6 text-[#595959] transition-all hover:border-[#48A9DE]/30 hover:text-[#48A9DE]"
              aria-label="GitHub"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://t.me/WorkWorkWeb3"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/6 text-[#595959] transition-all hover:border-[#48A9DE]/30 hover:text-[#48A9DE]"
              aria-label="Telegram"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.294c-.146.658-.537.818-1.084.508l-3-2.211-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.332-.373-.119l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.954l11.572-4.461c.537-.194 1.006.131.831.943z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div class="mt-12 flex flex-col gap-4 border-t border-black/6 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-[#8C8C8C]">
          &copy; 2025-{{ new Date().getFullYear() }} WorkWork. All rights reserved.
        </p>
        <div class="flex gap-6">
          <a href="#" class="text-sm text-[#8C8C8C] transition-colors hover:text-[#595959]">隐私政策</a>
          <a href="#" class="text-sm text-[#8C8C8C] transition-colors hover:text-[#595959]">服务条款</a>
        </div>
      </div>
    </div>
  </footer>
</template>
