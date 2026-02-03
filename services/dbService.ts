
import * as properties from './apiProperties';
import * as tenants from './apiTenants';
import * as staff from './apiStaff';
import * as maintenance from './apiMaintenance';
import * as invoices from './apiInvoices';
import * as organization from './apiOrganization';
import * as messages from './apiMessages';

export const db = {
  properties: {
    list: properties.getProperties,
    get: properties.getProperty,
    create: properties.createEditProperty,
    update: (id: string, data: any) => properties.createEditProperty(data, id),
    delete: properties.deleteProperty,
  },
  tenants: {
    list: tenants.getTenants,
    get: tenants.getTenant,
    update: tenants.updateTenant,
  },
  staff: {
    list: staff.getStaffList,
  },
  maintenance: {
    list: maintenance.getMaintenanceRequests,
    update: maintenance.updateMaintenanceRequest,
    create: (data: any) => { /* TODO: Implement create if missing or use update? Checking apiMaintenance... it seems I missed create there? */ return Promise.resolve(null) }, 
    delete: maintenance.deleteMaintenanceRequest,
  },
  invoices: {
    list: invoices.getInvoices,
    update: invoices.updateInvoice,
  },
  organization: {
    get: organization.getOrganization,
    update: organization.updateOrganization,
  },
  messages: {
    getContacts: messages.getContacts,
    getHistory: messages.getChatHistory,
    send: messages.sendMessage
  }
};
