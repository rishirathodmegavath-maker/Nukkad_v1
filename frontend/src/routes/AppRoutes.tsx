import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import OnboardingPage from '@/pages/onboarding/OnboardingPage'

import HomePage from '@/pages/home/HomePage'
import SearchResultsPage from '@/pages/search/SearchResultsPage'
import PeopleListPage from '@/pages/people/PeopleListPage'
import PersonProfilePage from '@/pages/people/PersonProfilePage'
import IdeasListPage from '@/pages/ideas/IdeasListPage'
import IdeaDetailPage from '@/pages/ideas/IdeaDetailPage'
import PostIdeaPage from '@/pages/ideas/PostIdeaPage'
import StartupsListPage from '@/pages/startups/StartupsListPage'
import StartupDetailPage from '@/pages/startups/StartupDetailPage'
import OpportunitiesListPage from '@/pages/opportunities/OpportunitiesListPage'
import OpportunityDetailPage from '@/pages/opportunities/OpportunityDetailPage'
import OpportunityApplicationsPage from '@/pages/opportunities/OpportunityApplicationsPage'
import ChaptersListPage from '@/pages/chapters/ChaptersListPage'
import CreateChapterPage from '@/pages/chapters/CreateChapterPage'
import ChapterDetailPage from '@/pages/chapters/ChapterDetailPage'
import InvestorsListPage from '@/pages/investors/InvestorsListPage'
import InvestorProfileFormPage from '@/pages/investors/InvestorProfileFormPage'
import InvestorProfilePage from '@/pages/investors/InvestorProfilePage'
import FundraiseDetailPage from '@/pages/investors/FundraiseDetailPage'
import IntroRequestsPage from '@/pages/investors/IntroRequestsPage'
import FeedPage from '@/pages/feed/FeedPage'
import PostDetailPage from '@/pages/feed/PostDetailPage'
import EventsListPage from '@/pages/events/EventsListPage'
import PostEventPage from '@/pages/events/PostEventPage'
import EventDetailPage from '@/pages/events/EventDetailPage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import MessagesPage from '@/pages/messages/MessagesPage'
import ResourcesPage from '@/pages/resources/ResourcesPage'
import ResourceDetailPage from '@/pages/resources/ResourceDetailPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />

          <Route path="/people" element={<PeopleListPage />} />
          <Route path="/people/:id" element={<PersonProfilePage />} />

          <Route path="/ideas" element={<IdeasListPage />} />
          <Route path="/ideas/new" element={<PostIdeaPage />} />
          <Route path="/ideas/:id" element={<IdeaDetailPage />} />

          <Route path="/startups" element={<StartupsListPage />} />
          <Route path="/startups/:id" element={<StartupDetailPage />} />

          <Route path="/opportunities" element={<OpportunitiesListPage />} />
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
          <Route path="/opportunities/:id/applications" element={<OpportunityApplicationsPage />} />

          <Route path="/chapters" element={<ChaptersListPage />} />
          <Route path="/chapters/new" element={<CreateChapterPage />} />
          <Route path="/chapters/:id" element={<ChapterDetailPage />} />

          <Route path="/investors" element={<InvestorsListPage />} />
          <Route path="/investors/activate" element={<InvestorProfileFormPage />} />
          <Route path="/investors/requests" element={<IntroRequestsPage />} />
          <Route path="/investors/fundraises/:id" element={<FundraiseDetailPage />} />
          <Route path="/investors/:id" element={<InvestorProfilePage />} />

          <Route path="/feed" element={<FeedPage />} />
          <Route path="/feed/:postId" element={<PostDetailPage />} />

          <Route path="/events" element={<EventsListPage />} />
          <Route path="/events/new" element={<PostEventPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />

          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:conversationId" element={<MessagesPage />} />

          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:id" element={<ResourceDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
