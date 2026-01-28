import { getProfileServer } from '@/api/user/profile'
import UserProfile from '@views/pages/user-profile'

export const metadata = {
  title: 'Perfil - Naturex',
  description: ''
}

const ProfilePage = async () => {
  const profile = await getProfileServer()

  return <UserProfile profile={profile} />
}

export default ProfilePage
