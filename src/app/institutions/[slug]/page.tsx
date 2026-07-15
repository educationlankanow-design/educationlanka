import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import InquiryForm from '@/components/InquiryForm'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const { data } = await supabase.from('institutions').select('name,city,meta_description').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: `${data.name} | EducationLanka`,
    description: data.meta_description || `${data.name} in ${data.city}, Sri Lanka. Find courses, contact details and submit an inquiry.`,
  }
}

export default async function InstitutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const { data: inst } = await supabase.from('institutions').select('*, categories(name,slug)').eq('slug', slug).single()
  if (!inst) notFound()
  const { data: courses } = await supabase.from('courses').select('*').eq('institution_id', inst.id).eq('is_active', true).order('level')
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-xs text-gray-400 mb-6 flex gap-2">
        <Link href="/" className="hover:text-[#1a3c6b]">Home</Link>
        <span>/</span>
        <Link href="/institutions" className="hover:text-[#1a3c6b]">Institutions</Link>
        {inst.categories && <><span>/</span><Link href={`/institutions?category=${(inst.categories as any).slug}`} className="hover:text-[#1a3c6b]">{(inst.categories as any).name}</Link></>}
        <span>/</span>
        <span className="text-gray-600">{inst.name}</span>
      </nav>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#1a3c6b] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">{inst.name[0]}</div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{inst.name}</h1>
                {inst.categories && <span className="inline-block text-xs bg-blue-50 text-[#1a3c6b] px-3 py-1 rounded-full mt-1">{(inst.categories as any).name}</span>}
                {inst.ugc_recognised && <span className="inline-block text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full mt-1 ml-2">UGC Recognised</span>}
              </div>
            </div>
            {inst.description && <p className="mt-4 text-gray-600 text-sm leading-relaxed">{inst.description}</p>}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {inst.address && <><dt className="text-gray-400">Address</dt><dd className="text-gray-700">{inst.address}</dd></>}
              {inst.city && <><dt className="text-gray-400">City</dt><dd className="text-gray-700">{inst.city}</dd></>}
              {inst.district && <><dt className="text-gray-400">District</dt><dd className="text-gray-700">{inst.district}</dd></>}
              {inst.province && <><dt className="text-gray-400">Province</dt><dd className="text-gray-700">{inst.province}</dd></>}
              {inst.institution_type && <><dt className="text-gray-400">Type</dt><dd className="text-gray-700">{inst.institution_type}</dd></>}
              {inst.affiliated_with && <><dt className="text-gray-400">Affiliated With</dt><dd className="text-gray-700">{inst.affiliated_with}</dd></>}
              {inst.curriculum && <><dt className="text-gray-400">Curriculum</dt><dd className="text-gray-700">{inst.curriculum}</dd></>}
              {inst.medium && <><dt className="text-gray-400">Medium</dt><dd className="text-gray-700">{inst.medium}</dd></>}
              {inst.gender && <><dt className="text-gray-400">Gender</dt><dd className="text-gray-700">{inst.gender}</dd></>}
            </dl>
          </div>
          {courses && courses.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Courses Offered</h2>
              <div className="space-y-3">
                {courses.map((course: any) => (
                  <div key={course.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{course.name}</h3>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {course.level && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{course.level}</span>}
                          {course.duration && <span className="text-xs text-gray-400">{course.duration}</span>}
                        </div>
                      </div>
                      {course.fees && <span className="text-sm font-semibold text-[#1a3c6b]">LKR {course.fees.toLocaleString()}</span>}
                    </div>
                    {course.description && <p className="text-xs text-gray-500 mt-2">{course.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">Contact</h2>
            {inst.phone && <a href={`tel:${inst.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1a3c6b]"><span className="text-gray-400">Tel:</span><span>{inst.phone}</span></a>}
            {inst.email && <a href={`mailto:${inst.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1a3c6b] break-all"><span className="text-gray-400">Email:</span><span>{inst.email}</span></a>}
            {inst.website && <a href={inst.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#1a3c6b] hover:underline"><span className="text-gray-400">Web:</span><span>{inst.website.replace(/^https?:\/\//, '')}</span></a>}
            {inst.address && <p className="flex items-start gap-2 text-sm text-gray-500"><span className="text-gray-400">Addr:</span><span>{inst.address}</span></p>}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Send an Inquiry</h2>
            <InquiryForm institutionId={inst.id} institutionName={inst.name} courses={courses || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
