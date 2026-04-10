import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// Utility to get portfolio owner user id
async function getPortfolioOwnerUserId() {
  const ownerEmail = process.env.PORTFOLIO_OWNER_EMAIL;
  if (!ownerEmail) return null;
  const userResult = await executeQuery('SELECT id FROM users WHERE email = ?', [ownerEmail]);
  const userRows = userResult.success && Array.isArray(userResult.data) ? userResult.data as any[] : [];
  if (userRows.length > 0) {
    return userRows[0].id;
  }
  return null;
}

// GET /api/contact-queries - Public (portfolio owner) or dashboard (auth)
export async function GET(request: NextRequest) {
  try {
    let userId = null;
    // Try to get user from auth header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload && payload.id) {
          userId = payload.id;
        }
      } catch (e) {}
    }
    if (!userId) {
      userId = await getPortfolioOwnerUserId();
    }
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Portfolio owner not configured or not found' },
        { status: 500 }
      );
    }
    const query = `
      SELECT * FROM contact_queries 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    const result = await executeQuery(query, [userId]);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get contact queries error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/contact-queries — contact or onboarding (authenticated)
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const formType = body.form_type || 'contact';
    const queryId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const st = body.status;
    const pr = body.priority;
    const status = ['new', 'in_progress', 'completed', 'cancelled'].includes(st) ? st : 'new';
    const priority = ['low', 'medium', 'high', 'urgent'].includes(pr) ? pr : 'medium';

    if (formType === 'onboarding') {
      const companyName = body.company_name ?? body.companyName;
      const contactPerson = body.contact_person ?? body.contactPerson;
      const businessDescription = body.business_description ?? body.businessDescription;

      if (!companyName || !contactPerson || !businessDescription) {
        return NextResponse.json(
          { success: false, error: 'company_name, contact_person, and business_description are required' },
          { status: 400 }
        );
      }

      const onboardingPriority = pr === undefined ? 'high' : priority;

      const insert = `
        INSERT INTO contact_queries (
          id, user_id, form_type, name, email,
          company_name, contact_person, communication_channel, business_description,
          target_customer, unique_value, problem_solving, core_features,
          existing_system, technical_constraints, competitors,
          brand_guide, color_preferences, tone_of_voice,
          payment_gateways, integrations, admin_control,
          gdpr_compliance, terms_privacy, launch_date, budget_range,
          post_mvp_features, long_term_goals, status, priority, created_at, updated_at
        ) VALUES (
          ?, ?, 'onboarding', ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
      `;

      const result = await executeQuery(insert, [
        queryId,
        request.user!.id,
        body.name || null,
        body.email || null,
        companyName,
        contactPerson,
        body.communication_channel ?? body.communicationChannel ?? null,
        businessDescription,
        body.target_customer ?? body.targetCustomer ?? null,
        body.unique_value ?? body.uniqueValue ?? null,
        body.problem_solving ?? body.problemSolving ?? null,
        body.core_features ?? body.coreFeatures ?? null,
        body.existing_system ?? body.existingSystem ?? null,
        body.technical_constraints ?? body.technicalConstraints ?? null,
        body.competitors ?? null,
        body.brand_guide ?? body.brandGuide ?? null,
        body.color_preferences ?? body.colorPreferences ?? null,
        body.tone_of_voice ?? body.toneOfVoice ?? null,
        body.payment_gateways ?? body.paymentGateways ?? null,
        body.integrations ?? null,
        body.admin_control ?? body.adminControl ?? null,
        Boolean(body.gdpr_compliance ?? body.gdprCompliance),
        Boolean(body.terms_privacy ?? body.termsPrivacy),
        (body.launch_date ?? body.launchDate) || null,
        body.budget_range ?? body.budgetRange ?? null,
        body.post_mvp_features ?? body.postMvpFeatures ?? null,
        body.long_term_goals ?? body.longTermGoals ?? null,
        status,
        onboardingPriority,
        now,
        now,
      ]);

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
      }

      const getResult = await executeQuery('SELECT * FROM contact_queries WHERE id = ?', [queryId]);
      return NextResponse.json(
        {
          success: true,
          data: (getResult.data as any[])?.[0],
          message: 'Onboarding query created successfully',
        },
        { status: 201 }
      );
    }

    const {
      name,
      email,
      phone,
      company,
      subject,
      message,
      budget,
      timeline,
      inquiry_type,
    } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO contact_queries (
        id, user_id, form_type, name, email, phone, company, subject, message,
        budget, timeline, inquiry_type, status, priority, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      queryId,
      request.user!.id,
      'contact',
      name,
      email,
      phone || null,
      company || null,
      subject,
      message,
      budget || null,
      timeline || null,
      inquiry_type || 'General Inquiry',
      status,
      priority,
      now,
      now,
    ]);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    const getResult = await executeQuery('SELECT * FROM contact_queries WHERE id = ?', [queryId]);

    return NextResponse.json(
      {
        success: true,
        data: (getResult.data as any[])?.[0],
        message: 'Contact query created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create contact query error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}); 