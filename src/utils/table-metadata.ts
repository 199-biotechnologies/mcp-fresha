export interface TableMetadata {
  name: string;
  description: string;
  dateColumn?: string;
  defaultOrderBy?: string;
  commonFilters?: string[];
  summaryFields?: string[];
}

export const FRESHA_TABLES: Record<string, TableMetadata> = {
  // Financial & Sales Reports
  CASH_FLOW: {
    name: 'CASH_FLOW',
    description: 'Cash flow statement data',
    dateColumn: 'PAYMENT_DATE',
    defaultOrderBy: 'PAYMENT_DATE ASC',
    commonFilters: ['TRANSACTION_TYPE', 'LOCATION', 'TEAM_MEMBER'],
    summaryFields: ['AMOUNT', 'OPENING_BALANCE', 'CLOSING_BALANCE'],
  },
  SALES: {
    name: 'SALES',
    description: 'Comprehensive sales transactions',
    dateColumn: 'SALE_DATE',
    defaultOrderBy: 'SALE_DATE DESC',
    commonFilters: ['LOCATION_ID', 'TEAM_MEMBER_ID', 'CLIENT_ID', 'PAYMENT_STATUS'],
    summaryFields: ['TOTAL_SALES', 'GROSS_SALES', 'NET_SALES', 'TOTAL_REFUND', 'TOTAL_DISCOUNT'],
  },
  SALE_ITEMS: {
    name: 'SALE_ITEMS',
    description: 'Individual items within sales',
    dateColumn: 'SALE_DATE',
    defaultOrderBy: 'SALE_DATE DESC',
    commonFilters: ['SALE_ID', 'ITEM_CATEGORY', 'SUPPLIER', 'BRAND'],
  },
  PAYMENTS: {
    name: 'PAYMENTS',
    description: 'All payment records',
    dateColumn: 'PAYMENT_DATE',
    defaultOrderBy: 'PAYMENT_DATE DESC',
    commonFilters: ['SALE_ID', 'APPOINTMENT_ID', 'CLIENT_ID', 'LOCATION_ID'],
  },
  COMMISSIONS: {
    name: 'COMMISSIONS',
    description: 'Team member commission records',
    dateColumn: 'COMMISSION_DATE',
    defaultOrderBy: 'COMMISSION_DATE DESC',
    commonFilters: ['TEAM_MEMBER_ID', 'LOCATION_ID', 'CLIENT_ID'],
    summaryFields: ['GROSS_SALES', 'COMMISSION'],
  },
  SERVICE_CHARGES: {
    name: 'SERVICE_CHARGES',
    description: 'Service charges applied during sales',
    dateColumn: 'CHARGE_DATE',
    defaultOrderBy: 'CHARGE_DATE DESC',
    commonFilters: ['SALE_ID', 'LOCATION_ID', 'TEAM_MEMBER_ID'],
  },
  TAXES: {
    name: 'TAXES',
    description: 'Tax information',
    defaultOrderBy: 'TAX_ID',
  },
  TIPS: {
    name: 'TIPS',
    description: 'Tip records',
    dateColumn: 'TIP_DATE',
    defaultOrderBy: 'TIP_DATE DESC',
    commonFilters: ['TEAM_MEMBER_ID', 'LOCATION_ID'],
  },
  WAGES: {
    name: 'WAGES',
    description: 'Wage information',
    dateColumn: 'WAGE_DATE',
    defaultOrderBy: 'WAGE_DATE DESC',
    commonFilters: ['TEAM_MEMBER_ID'],
  },
  DEPOSITS: {
    name: 'DEPOSITS',
    description: 'Upfront payment deposits',
    dateColumn: 'DEPOSIT_DATE',
    defaultOrderBy: 'DEPOSIT_DATE DESC',
    commonFilters: ['CLIENT_ID', 'LOCATION_ID'],
  },
  GIFT_CARDS: {
    name: 'GIFT_CARDS',
    description: 'Gift card transactions',
    dateColumn: 'TRANSACTION_DATE',
    defaultOrderBy: 'TRANSACTION_DATE DESC',
    commonFilters: ['GIFT_CARD_ID', 'CLIENT_ID'],
  },

  // Booking & Appointment Data
  BOOKINGS: {
    name: 'BOOKINGS',
    description: 'Service bookings for appointments',
    dateColumn: 'BOOKING_DATE',
    defaultOrderBy: 'BOOKING_DATE DESC',
    commonFilters: ['APPOINTMENT_ID', 'SERVICE_ID', 'CLIENT_ID', 'TEAM_MEMBER_ID', 'STATUS'],
  },
  WAITLIST: {
    name: 'WAITLIST',
    description: 'Waitlist information',
    dateColumn: 'WAITLIST_DATE',
    defaultOrderBy: 'WAITLIST_DATE DESC',
    commonFilters: ['CLIENT_ID', 'SERVICE_ID', 'LOCATION_ID'],
  },

  // Client Management
  CLIENTS: {
    name: 'CLIENTS',
    description: 'Client information and history',
    defaultOrderBy: 'CLIENT_NAME',
    commonFilters: ['CLIENT_ID', 'LOCATION_ID', 'IS_DELETED'],
  },
  CLIENT_NOTES: {
    name: 'CLIENT_NOTES',
    description: 'Notes about clients',
    dateColumn: 'NOTE_DATE',
    defaultOrderBy: 'NOTE_DATE DESC',
    commonFilters: ['CLIENT_ID', 'TEAM_MEMBER_ID'],
  },
  MEMBERSHIPS: {
    name: 'MEMBERSHIPS',
    description: 'Client membership information',
    dateColumn: 'START_DATE',
    defaultOrderBy: 'START_DATE DESC',
    commonFilters: ['CLIENT_ID', 'MEMBERSHIP_TYPE', 'STATUS'],
  },

  // Inventory & Products
  PRODUCTS: {
    name: 'PRODUCTS',
    description: 'Products offered for sale',
    defaultOrderBy: 'PRODUCT_NAME',
    commonFilters: ['PRODUCT_ID', 'SUPPLIER', 'BRAND', 'IS_DELETED'],
  },
  STOCK_MOVEMENTS: {
    name: 'STOCK_MOVEMENTS',
    description: 'Inventory movement tracking',
    dateColumn: 'MOVEMENT_DATE',
    defaultOrderBy: 'MOVEMENT_DATE DESC',
    commonFilters: ['PRODUCT_ID', 'LOCATION_ID', 'MOVEMENT_TYPE'],
  },
  STOCK_ORDERS: {
    name: 'STOCK_ORDERS',
    description: 'Stock order records',
    dateColumn: 'ORDER_DATE',
    defaultOrderBy: 'ORDER_DATE DESC',
    commonFilters: ['ORDER_ID', 'SUPPLIER_ID', 'STATUS'],
  },

  // Business Operations
  LOCATIONS: {
    name: 'LOCATIONS',
    description: 'Business locations',
    defaultOrderBy: 'LOCATION_NAME',
    commonFilters: ['LOCATION_ID', 'IS_DELETED'],
  },
  SERVICES: {
    name: 'SERVICES',
    description: 'Services offered',
    defaultOrderBy: 'SERVICE_NAME',
    commonFilters: ['SERVICE_ID', 'SERVICE_CATEGORY', 'IS_DELETED'],
  },
  TEAM_MEMBERS: {
    name: 'TEAM_MEMBERS',
    description: 'Staff information',
    defaultOrderBy: 'TEAM_MEMBER_NAME',
    commonFilters: ['TEAM_MEMBER_ID', 'LOCATION_ID', 'ROLE', 'IS_DELETED'],
  },
  OCCUPANCY: {
    name: 'OCCUPANCY',
    description: 'Employee occupancy and shifts',
    dateColumn: 'OCCUPANCY_DATE',
    defaultOrderBy: 'OCCUPANCY_DATE DESC',
    commonFilters: ['TEAM_MEMBER_ID', 'LOCATION_ID'],
  },
  TIMESHEETS: {
    name: 'TIMESHEETS',
    description: 'Timesheet records',
    dateColumn: 'TIMESHEET_DATE',
    defaultOrderBy: 'TIMESHEET_DATE DESC',
    commonFilters: ['TEAM_MEMBER_ID', 'LOCATION_ID'],
  },
  TIME_OFF: {
    name: 'TIME_OFF',
    description: 'Time off records',
    dateColumn: 'TIME_OFF_DATE',
    defaultOrderBy: 'TIME_OFF_DATE DESC',
    commonFilters: ['TEAM_MEMBER_ID', 'TIME_OFF_TYPE', 'STATUS'],
  },
};

export function getTableMetadata(tableName: string): TableMetadata | undefined {
  return FRESHA_TABLES[tableName.toUpperCase()];
}