"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const supabase_1 = require("./utils/supabase");
async function seed() {
    console.log('Seeding data...');
    const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
    // Use a fixed UUID for the demo user so we can upsert easily
    const demoUserId = '550e8400-e29b-41d4-a716-446655440000';
    // 1. Upsert a demo user (Update if exists, otherwise Insert)
    const { data: userData, error: userError } = await supabase_1.supabase
        .from('users')
        .upsert({
        id: demoUserId,
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
        phone: '+976 99112233',
        is_verified: true,
        avatar: `https://api.dicebear.com/6.x/initials/svg?seed=Demo`,
        user_type: 'employer',
    }, { onConflict: 'id' })
        .select()
        .single();
    if (userError) {
        console.error('Error seeding user:', userError);
        return;
    }
    console.log('User seeded/verified.');
    // 2. Create demo jobs
    const jobs = [
        {
            id: crypto.randomUUID(),
            title: 'Ахлах нягтлан бодогч',
            company_name: 'М-Си-Эс Групп',
            company_logo: 'https://ui-avatars.com/api/?name=MCS+Group&background=random&size=256',
            description: 'Байгууллагын санхүүгийн үйл ажиллагааг удирдах, тайлан тэнцэл гаргах.',
            requirements: 'Санхүү, нягтлан бодох бүртгэлийн чиглэлээр бакалавр болон түүнээс дээш зэрэгтэй.',
            salary_min: 3000000,
            salary_max: 4500000,
            salary_type: 'range',
            job_type: 'full-time',
            category: 'FINANCE_ACCOUNTING',
            location: 'Сүхбаатар дүүрэг, Улаанбаатар',
            latitude: 47.9188,
            longitude: 106.9176,
            user_id: demoUserId,
        },
        {
            id: crypto.randomUUID(),
            title: 'Full Stack Developer',
            company_name: 'Unitel Group',
            company_logo: 'https://ui-avatars.com/api/?name=Unitel+Group&background=random&size=256',
            description: 'React болон Node.js дээр суурилсан систем хөгжүүлэлт.',
            requirements: '3-аас дээш жилийн ажлын туршлагатай.',
            salary_min: 4000000,
            salary_max: 6000000,
            salary_type: 'range',
            job_type: 'full-time',
            category: 'IT_SOFTWARE',
            location: 'Хан-Уул дүүрэг, Улаанбаатар',
            latitude: 47.8924,
            longitude: 106.9057,
            user_id: demoUserId,
        },
        {
            id: crypto.randomUUID(),
            title: 'Борлуулалтын менежер',
            company_name: 'Gobi Cashmere',
            company_logo: 'https://ui-avatars.com/api/?name=Gobi+Cashmere&background=random&size=256',
            description: 'Борлуулалтын төлөвлөгөө гаргах, хэрэгжүүлэх.',
            requirements: 'Харилцааны өндөр соёлтой, борлуулалтын туршлагатай.',
            salary_min: 1500000,
            salary_max: 3000000,
            salary_type: 'range',
            job_type: 'full-time',
            category: 'SALES_MARKETING',
            location: 'Чингэлтэй дүүрэг, Улаанбаатар',
            latitude: 47.9231,
            longitude: 106.9112,
            user_id: demoUserId,
        }
    ];
    await supabase_1.supabase.from('jobs').delete().eq('user_id', demoUserId);
    const { error: jobError } = await supabase_1.supabase
        .from('jobs')
        .insert(jobs);
    if (jobError) {
        console.error('Error seeding jobs:', jobError);
        return;
    }
    console.log('Seeding completed successfully!');
}
seed();
//# sourceMappingURL=seed.js.map