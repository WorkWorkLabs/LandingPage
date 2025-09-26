<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <!-- Left side - Company info and description -->
        <div class="footer-left">
          <div class="footer-brand">
            <img src="/images/brandname.svg" alt="WorkWork" />
          </div>
          <p class="footer-description">
            WorkWork is building a globally remote working ecosystem for digital
            nomads, remote workers, freelancers, and super individuals. We are
            committed to breaking down geographical barriers and creating a
            digital infrastructure for global community collaboration.
          </p>

          <!-- Social links -->
          <div class="social-links">
            <a
              href="https://x.com/WorkWorkOrg"
              class="social-link"
              aria-label="Twitter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="social-icon" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                />
              </svg>
            </a>
            <a
              href="https://github.com/WorkWorkLabs"
              class="social-link"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="social-icon" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
            </a>
            <a
              href="https://www.t.me/WorkWorkWeb3/"
              class="social-link"
              aria-label="Telegram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="social-icon" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.787l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
                />
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="YouTube">
              <svg class="social-icon" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                />
              </svg>
            </a>
          </div>

          <!-- Navigation links -->
          <nav class="footer-nav">
            <a href="#home" class="nav-link">Home</a>
            <span class="nav-separator">|</span>
            <a href="#features" class="nav-link">Working</a>
            <span class="nav-separator">|</span>
            <a href="#products" class="nav-link">Case</a>
            <span class="nav-separator">|</span>
            <a href="#team" class="nav-link">Team</a>
            <span class="nav-separator">|</span>
            <a href="#contact" class="nav-link">Contact Us</a>
          </nav>
        </div>

        <!-- Right side - Mascot -->
        <div class="footer-right">
          <!-- Mascot area -->
          <div class="footer-mascot">
            <div class="mascot-text">
              <img
                src="/images/brandname.svg"
                alt="WorkWork"
                class="brand-logo"
              />
            </div>
            <!-- Wolf mascot image -->
            <div class="mascot-image">
              <img src="/images/wolf.svg" alt="Wolf mascot" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// No imports needed
</script>

<style scoped>
.app-footer {
  background-color: #00a1ff;
  padding: 40px 100px 0 100px; /* 底部padding改为0 */
  color: white;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative; /* 为绝对定位做准备 */
  min-height: 120px; /* 给footer一个最小高度 */
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 60px;
}

.footer-left {
  flex: 1;
  max-width: 500px;
}

.footer-brand {
  margin: 0 0 20px 0;
}

.footer-brand img {
  height: 32px;
  width: auto;
}

.footer-description {
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.6;
  color: white;
  margin-bottom: 30px;
  opacity: 0.9;
}

.social-links {
  display: flex;
  gap: 20px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: white;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.social-link:hover {
  opacity: 0.8;
}

.social-icon {
  width: 24px;
  height: 24px;
}

.footer-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 20px; /* 改为上边距，因为现在在社交链接下面 */
  margin-bottom: 50px; /* 加点下边距，不要贴得太死 */
}

.nav-link {
  color: white;
  text-decoration: none;
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  font-weight: 400;
  transition: opacity 0.3s ease;
}

.nav-link:hover {
  opacity: 0.8;
}

.nav-separator {
  color: white;
  opacity: 0.6;
}

.footer-mascot {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  height: 100%; /* 让容器占满高度 */
}

.brand-logo {
  height: 24px;
  width: auto;
  display: none; /* 隐藏品牌logo */
}

.mascot-image {
  width: 300px; /* 增大狼图尺寸 */
  height: 250px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: absolute; /* 绝对定位 */
  bottom: 0; /* 直接贴底 */
  right: 0; /* 贴右边 */
}

.mascot-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 768px) {
  .app-footer {
    padding: 30px 50px 0 50px; /* 移动端也去掉底部padding */
  }

  .footer-content {
    flex-direction: column;
    gap: 30px;
  }

  .footer-right {
    align-items: flex-start;
  }

  .footer-nav {
    flex-wrap: wrap;
    gap: 15px;
  }

  .footer-mascot {
    justify-content: flex-start;
  }
}
</style>
