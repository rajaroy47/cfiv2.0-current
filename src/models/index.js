


// ── Model Index ───────────────────────────────────────────────────────
// Import from here so you never need to remember individual file paths:
// import { User, Order, Payment } from "../models/index.js"

export { default as User } from "./user.model.js";
export { default as Role } from "./role.model.js";
export { default as Permission } from "./permission.model.js";
export { default as Service } from "./service.model.js";
export { default as ServicePlan } from "./servicePlan.model.js";
export { default as Order } from "./order.model.js";
export { default as Payment } from "./payment.model.js";
export { default as Task } from "./task.model.js";
export { default as Document } from "./document.model.js";
export { default as Chat } from "./chat.model.js";
export { default as Message } from "./message.model.js";
export { default as Notification } from "./notification.model.js";
export { default as Invoice } from "./invoice.model.js";
export { default as SupportTicket } from "./supportTicket.model.js";
export { default as ActivityLog } from "./activityLog.model.js";
export { default as AuditTrail } from "./auditTrail.model.js";
export { default as CMSPage } from "./cmsPage.model.js";
export { default as WebsiteSetting } from "./websiteSetting.model.js";
export { default as FAQ } from "./faq.model.js";
export { default as EmailTemplate } from "./emailTemplate.model.js";

// ── Named constants (re-exported for convenience) ─────────────────────
export { ORDER_STATUS, PAYMENT_STATUS } from "./order.model.js";
export { PAYMENT_METHODS } from "./payment.model.js";
export { ACTIONS } from "./activityLog.model.js";
export { EMAIL_TEMPLATES } from "./emailTemplate.model.js";

