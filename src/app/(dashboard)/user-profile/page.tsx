// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Type Imports
import type { Data } from '@/types/pages/profileTypes'

// Component Imports
import UserProfile from '@views/pages/user-profile'

// Data Imports
// import { getProfileData } from '@/app/server/actions'

const ProfileTab = dynamic(() => import('@views/pages/user-profile/profile'))
const TeamsTab = dynamic(() => import('@views/pages/user-profile/teams'))
const ProjectsTab = dynamic(() => import('@views/pages/user-profile/projects'))
const ConnectionsTab = dynamic(() => import('@views/pages/user-profile/connections'))

// Vars
const tabContentList = (data?: Data): { [key: string]: ReactElement } => ({
  profile: <ProfileTab data={data?.users.profile} />,
  teams: <TeamsTab data={data?.users.teams} />,
  projects: <ProjectsTab data={data?.users.projects} />,
  connections: <ConnectionsTab data={data?.users.connections} />
})

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/pages/profile` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

const getProfileData = async () => {
  // API Call simulation example con data fake
  return {
    users: {
      profile: {
        teams: [
          { value: 'Design Team', property: 'UI/UX' },
          { value: 'Product Team', property: 'Product' },
          { value: 'Frontend Team', property: 'Engineering' }
        ],
        about: [
          { icon: 'tabler-user', value: 'Frontend developer con 6 años de experiencia', property: 'About' },
          { icon: 'tabler-briefcase', value: 'Naturex - Equipo de Producto', property: 'Company' },
          { icon: 'tabler-map-pin', value: 'Madrid, Spain', property: 'Location' }
        ],
        contacts: [
          { icon: 'tabler-mail', value: 'juan.perez@example.com', property: 'Email' },
          { icon: 'tabler-phone', value: '+34 600 000 000', property: 'Phone' },
          { icon: 'tabler-globe', value: 'https://juanperez.dev', property: 'Website' }
        ],
        overview: [
          { icon: 'tabler-award', value: 'Senior Frontend Developer', property: 'Role' },
          { icon: 'tabler-calendar', value: 'Joined Jan 2020', property: 'Joined' },
          { icon: 'tabler-info-circle', value: 'Especializado en React/Next.js y accesibilidad', property: 'Summary' }
        ],
        teamsTech: [
          {
            title: 'Design System',
            avatar: '/images/icons/team-ds.png',
            members: 6,
            chipText: 'React',
            ChipColor: 'primary'
          },
          {
            title: 'Platform',
            avatar: '/images/icons/team-platform.png',
            members: 8,
            chipText: 'Node',
            ChipColor: 'success'
          }
        ],
        connections: [
          {
            name: 'María López',
            avatar: '/images/avatars/4.png',
            isFriend: true,
            connections: '120'
          }
        ],
        projectTable: [
          {
            id: 1,
            title: 'Website Redesign',
            subtitle: 'Revamp UI/UX',
            leader: 'María López',
            avatar: '/images/icons/project-1.png',
            avatarGroup: ['/images/avatars/2.png', '/images/avatars/3.png'],
            status: 2,
            actions: 'view'
          },
          {
            id: 2,
            title: 'Mobile App',
            subtitle: 'iOS/Android',
            leader: 'Carlos Díaz',
            avatar: '/images/icons/project-2.png',
            avatarGroup: ['/images/avatars/5.png', '/images/avatars/6.png'],
            status: 1,
            actions: 'view'
          }
        ]
      },
      teams: [
        {
          title: 'Design Team',
          avatar: '/images/avatars/2.png',
          description: 'Equipo encargado del diseño de interfaces',
          extraMembers: 3,
          chips: [
            { title: 'Figma', color: 'info' },
            { title: 'Accessibility', color: 'success' }
          ],
          avatarGroup: [
            { name: 'Ana', avatar: '/images/avatars/7.png' },
            { name: 'Luis', avatar: '/images/avatars/8.png' }
          ]
        },
        {
          title: 'Platform',
          avatar: '/images/avatars/3.png',
          description: 'Backend y plataforma',
          chips: [{ title: 'Node', color: 'primary' }],
          avatarGroup: [{ name: 'Carlos', avatar: '/images/avatars/5.png' }]
        }
      ],
      projects: [
        {
          hours: '320h',
          tasks: '24',
          title: 'Website Redesign',
          budget: '$12,000',
          client: 'Naturex',
          avatar: '/images/icons/project-1.png',
          members: '6',
          daysLeft: 45,
          comments: 12,
          deadline: '2025-12-01',
          startDate: '2025-06-01',
          totalTask: 30,
          budgetSpent: '$7,800',
          description: 'Rediseño completo del sitio web corporativo',
          chipColor: 'primary',
          completedTask: 18,
          avatarColor: 'primary',
          avatarGroup: [
            { name: 'Ana', avatar: '/images/avatars/7.png' },
            { name: 'Luis', avatar: '/images/avatars/8.png' }
          ]
        },
        {
          hours: '150h',
          tasks: '12',
          title: 'Mobile App',
          budget: '$30,000',
          client: 'Client B',
          avatar: '/images/icons/project-2.png',
          members: '4',
          daysLeft: 90,
          comments: 8,
          deadline: '2026-03-15',
          startDate: '2025-10-01',
          totalTask: 20,
          budgetSpent: '$9,000',
          description: 'Aplicación móvil iOS/Android',
          chipColor: 'warning',
          completedTask: 6,
          avatarGroup: [
            { name: 'Carlos', avatar: '/images/avatars/5.png' },
            { name: 'Sofía', avatar: '/images/avatars/9.png' }
          ]
        }
      ],
      connections: [
        {
          name: 'María López',
          tasks: '12',
          avatar: '/images/avatars/4.png',
          projects: '3',
          connections: '120',
          designation: 'Product Manager',
          isConnected: true,
          chips: [{ title: 'PM', color: 'success' }]
        },
        {
          name: 'Carlos Díaz',
          tasks: '8',
          avatar: '/images/avatars/5.png',
          projects: '2',
          connections: '85',
          designation: 'Backend Engineer',
          isConnected: false,
          chips: [{ title: 'API', color: 'info' }]
        }
      ]
    },
    profileHeader: {
      fullName: 'Deiby Moreno',
      coverImg: '/images/banner/profile-cover.jpg',
      location: 'Madrid, Spain',
      profileImg: '/images/avatars/1.png',
      joiningDate: 'Jan 2020',
      designation: 'Senior Frontend Developer',
      designationIcon: 'tabler-star'
    }
  }
}

const ProfilePage = async () => {
  // Vars
  const data = await getProfileData()

  return <UserProfile data={data} tabContentList={tabContentList(data)} />
}

export default ProfilePage
