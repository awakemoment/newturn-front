/**
 * Stripe 결제 API
 */
import { apiClient } from '../axios'


export async function subscribeToTier(tier: 'standard' | 'premium') {
  const { data } = await apiClient.post<{
    checkout_url: string
    session_id: string
  }>('/api/payments/create-checkout/', { tier })
  
  return data
}


export async function openCustomerPortal() {
  const { data } = await apiClient.post<{
    portal_url: string
  }>('/api/payments/create-portal/')
  
  return data
}


export interface Subscription {
  tier: 'free' | 'standard' | 'premium'
  status: 'active' | 'canceled' | 'past_due' | null
  expires_at: string | null
}


export async function getMySubscription(): Promise<Subscription> {
  const { data } = await apiClient.get('/api/users/me/')
  
  return {
    tier: data.membership_tier,
    status: data.subscription_status,
    expires_at: data.membership_expires_at
  }
}

