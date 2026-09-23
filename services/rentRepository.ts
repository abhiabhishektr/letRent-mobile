/** Replace these async methods with API calls when the backend is available. */
export type Collection = {
  id: string;
  tenant: string;
  unit: string;
  amount: number;
  date: string;
  status: "Paid" | "Due" | "Late Fee";
};
export type Property = {
  id: string;
  name: string;
  address: string;
  units: string;
  occupied: string;
  property_type?: string;
  city?: string;
  state?: string;
  pincode?: string;
};
export type OwnerTenant = Collection & { property: string; dateKey: string };
export type PropertyQuery = { search?: string };
export type TenantQuery = { search?: string; status?: OwnerTenant['status'] | ''; date?: string; property?: string };

const PROPERTIES: Property[] = [
  { id: 'property-1', name: 'Green View Apartments', address: 'Koramangala, Bengaluru', units: '8 units', occupied: '7 occupied', property_type: 'RESIDENTIAL' },
  { id: 'property-2', name: 'Lake Side Residency', address: 'HSR Layout, Bengaluru', units: '6 units', occupied: '5 occupied', property_type: 'RESIDENTIAL' },
  { id: 'property-3', name: 'Palm Grove Villa', address: 'Indiranagar, Bengaluru', units: '2 units', occupied: '2 occupied', property_type: 'RESIDENTIAL' },
];
const OWNER_TENANTS: OwnerTenant[] = [
  { id: 'c1', tenant: 'Rahul Sharma', unit: 'Unit 101', property: 'Green View Apartments', amount: 12000, date: '1 Sep 2025', dateKey: '2025-09', status: 'Paid' },
  { id: 'c2', tenant: 'Anita Nair', unit: 'Unit 202', property: 'Lake Side Residency', amount: 15000, date: '1 Sep 2025', dateKey: '2025-09', status: 'Paid' },
  { id: 'c3', tenant: 'Vikram Shah', unit: 'Unit 103', property: 'Green View Apartments', amount: 10500, date: '1 Sep 2025', dateKey: '2025-09', status: 'Due' },
  { id: 'c4', tenant: 'Priya Menon', unit: 'Unit 305', property: 'Palm Grove Villa', amount: 18000, date: '1 Aug 2025', dateKey: '2025-08', status: 'Late Fee' },
];
export const rentRepository = {
  async getTenantDashboard() {
    return {
      tenant: { name: "Rahul", unit: "Unit 101, Green View Apartments" },
      rent: {
        month: "September",
        dueOn: "Due on 1 September",
        amount: 12000,
        status: "Due" as const,
      },
      overview: [
        { label: "Total Paid", value: "₹24,000" },
        { label: "Pending", value: "₹12,000" },
        { label: "Late Fees", value: "₹0" },
      ],
    };
  },
  async getOwnerDashboard() {
    return {
      collection: 124000,
      change: "+12% from last month",
      metrics: [
        { icon: "⌂", label: "Properties", value: "12", color: "#eaf9ef" },
        { icon: "♟", label: "Tenants", value: "18", color: "#e9f1ff" },
        { icon: "▣", label: "Units", value: "24", color: "#f2ecff" },
        { icon: "!", label: "Overdue", value: "5", color: "#fff0f1" },
      ],
      collections: OWNER_TENANTS as Collection[],
    };
  },
  async getProperties(query: PropertyQuery = {}): Promise<Property[]> {
    const search = query.search?.trim().toLowerCase() ?? '';
    return !search ? [...PROPERTIES] : PROPERTIES.filter((property) => `${property.name} ${property.address}`.toLowerCase().includes(search));
  },
  async addProperty(property: Omit<Property, 'id' | 'units' | 'occupied'> & Partial<Pick<Property, 'id' | 'units' | 'occupied'>>): Promise<Property> {
    const created: Property = {
      id: property.id ?? `property-${Date.now()}`,
      name: property.name,
      address: property.address,
      units: property.units ?? '1 unit',
      occupied: property.occupied ?? '0 occupied',
      property_type: property.property_type,
      city: property.city,
      state: property.state,
      pincode: property.pincode,
    };
    PROPERTIES.unshift(created);
    return created;
  },
  async getOwnerTenants(query: TenantQuery = {}): Promise<OwnerTenant[]> {
    const search = query.search?.trim().toLowerCase() ?? '';
    return OWNER_TENANTS.filter((tenant) => {
      const matchesSearch = !search || `${tenant.tenant} ${tenant.amount}`.toLowerCase().includes(search);
      return matchesSearch && (!query.status || tenant.status === query.status) && (!query.date || tenant.dateKey === query.date) && (!query.property || tenant.property === query.property);
    });
  },
  async getReceipts(): Promise<Collection[]> {
    return [
      {
        id: "r1",
        tenant: "September Rent",
        unit: "Paid on 1 Sep 2025",
        amount: 12000,
        date: "Paid",
        status: "Paid",
      },
      {
        id: "r2",
        tenant: "August Rent",
        unit: "Paid on 1 Aug 2025",
        amount: 12000,
        date: "Paid",
        status: "Paid",
      },
    ];
  },
};
