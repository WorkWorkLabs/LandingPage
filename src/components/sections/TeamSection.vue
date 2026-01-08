<template>
  <section id="team" class="team-section">
    <div class="container mx-auto">
      <div class="section-header">
        <h2 class="section-title">
          We care deeply about the quality of our work
        </h2>
        <p class="section-description">
          Work Work has always been a fully remote company. Today, our small but
          mighty team is distributed across Mainland China, Hong Kong and Japan.
          What unites us is relentless focus, fast execution, and our passion
          for software craftsmanship. We are all makers at heart and care deeply
          about the quality of our work, down to the smallest detail.
        </p>
        <div class="join-us-form">
          <h3 class="form-title">Join us</h3>
          <div class="form-group">
            <input
              type="email"
              class="email-input"
              placeholder="Enter your email"
            />
            <button type="submit" class="submit-btn">Submit</button>
          </div>
        </div>
      </div>

      <!-- Team Members Section -->
      <div class="team-member-section">
        <h3 class="team-member-title">Team Members</h3>
        <div v-if="loading" class="loading-message">
          Loading team members...
        </div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        <div v-else class="team-grid">
          <TeamMemberCard
            v-for="member in teamMembers"
            :key="member.id"
            :member="member"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useTeamMembers } from "@/composables/useTeamMembers";
import TeamMemberCard from "./TeamMemberCard.vue";

const { teamMembers, loading, error } = useTeamMembers();

// #region agent log
import { watch } from 'vue';
watch([teamMembers, loading, error], ([members, isLoading, err]) => {
  const logDataB = {location:'TeamSection.vue:53',message:'TeamSection state changed',data:{teamMembersCount:members.length,loading:isLoading,error:err,memberIds:members.map((m:any)=>m.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
  console.log('[DEBUG]', logDataB);
  fetch('http://127.0.0.1:7242/ingest/353a4726-f634-4d1e-b9bb-65ed440c7233',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataB)}).catch(()=>{});
}, { immediate: true });
// #endregion
</script>

<style scoped>
.team-section {
  background-color: #00a1ff;
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  padding: 2rem 500px 2rem 100px;
}

.section-header {
  @apply text-left mb-16;
}

.section-title {
  @apply text-4xl md:text-5xl font-bold;
  color: #ffffff;
  text-align: left;
  margin-bottom: 32px;
}

.section-description {
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0%;
  color: #ffffff;
  text-align: left;
  max-width: none;
}

.join-us-form {
  margin-top: 24px;
}

.form-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: left;
}

.form-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.email-input {
  background-color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  flex: 1;
  max-width: 300px;
  outline: none;
}

.email-input:focus {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.submit-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: white;
  color: #00a1ff;
}

.team-member-section {
  margin-top: 64px;
}

.team-member-title {
  font-family: "Roboto", sans-serif;
  font-weight: bold;
  font-size: 32px;
  line-height: 38px;
  letter-spacing: 0%;
  color: #ffffff;
  text-align: left;
  margin-bottom: 24px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem 1.5rem; /* 行间距2rem，列间距1.5rem */
  margin-top: 2rem;
}

.loading-message,
.error-message {
  color: white;
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.error-message {
  color: #ff6b6b;
}

@media (max-width: 768px) {
  .team-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.text-primary {
  color: #00a1ff;
}
</style>
