import { AuthUser, UserRole } from '@/lib/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseResponseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const payload = (data ?? {}) as { message?: string | string[] };
    const message =
      typeof payload.message === 'string'
        ? payload.message
        : Array.isArray(payload.message)
          ? payload.message[0]
          : 'Something went wrong';
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface UserProfile extends AuthUser {}

export interface Role {
  id: string;
  name: UserRole;
  label: string;
  description: string;
}

export interface UserWithRole {
  id: string;
  username: string;
  fullName: string;
  isActive: boolean;
  role: {
    id: string;
    name: UserRole;
    label: string;
  } | null;
  createdAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  brandId?: string;
  investigationId?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export const DEFAULT_PAGE_SIZE = 10;

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function toQuery(params?: PaginationParams) {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.status) search.set('status', params.status);
  if (params?.search?.trim()) search.set('search', params.search.trim());
  if (params?.brandId) search.set('brandId', params.brandId);
  if (params?.investigationId) search.set('investigationId', params.investigationId);
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function getUploadOrigin() {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api').replace(
    /\/api\/?$/,
    '',
  );
}

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName?: string;
  roleName?: string;
}

export interface CreateRolePayload {
  name: string;
  label: string;
  description?: string;
}

export const api = {
  login: (username: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getProfile: (token: string) =>
    request<UserProfile>('/auth/profile', {
      headers: authHeaders(token),
    }),

  getRoles: (token: string) =>
    request<Role[]>('/roles', {
      headers: authHeaders(token),
    }),

  createRole: (token: string, payload: CreateRolePayload) =>
    request<Role>('/roles', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  getUsers: (token: string, params?: PaginationParams) =>
    request<PaginatedResponse<UserWithRole>>(`/users${toQuery(params)}`, {
      headers: authHeaders(token),
    }),

  createUser: (token: string, payload: CreateUserPayload) =>
    request<UserWithRole>('/users', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  assignUserRole: (token: string, userId: string, roleName: string) =>
    request<UserWithRole>(`/users/${userId}/role`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ roleName }),
    }),

  getCustomers: (token: string, params?: PaginationParams) =>
    request<PaginatedResponse<Customer>>(`/customers${toQuery(params)}`, {
      headers: authHeaders(token),
    }),

  createCustomer: (token: string, payload: CreateCustomerPayload) =>
    request<Customer>('/customers', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  updateCustomer: (token: string, id: string, payload: UpdateCustomerPayload) =>
    request<Customer>(`/customers/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteCustomer: (token: string, id: string) =>
    request<{ message: string }>(`/customers/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getSuppliers: (token: string, params?: PaginationParams) =>
    request<PaginatedResponse<Supplier>>(`/suppliers${toQuery(params)}`, {
      headers: authHeaders(token),
    }),

  createSupplier: (token: string, payload: CreateSupplierPayload) =>
    request<Supplier>('/suppliers', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  updateSupplier: (token: string, id: string, payload: UpdateSupplierPayload) =>
    request<Supplier>(`/suppliers/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteSupplier: (token: string, id: string) =>
    request<{ success: boolean }>(`/suppliers/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getContractors: (token: string, params?: PaginationParams) =>
    request<PaginatedResponse<Contractor>>(`/contractors${toQuery(params)}`, {
      headers: authHeaders(token),
    }),

  createContractor: (token: string, payload: CreateContractorPayload) =>
    request<Contractor>('/contractors', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  updateContractor: (token: string, id: string, payload: UpdateContractorPayload) =>
    request<Contractor>(`/contractors/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteContractor: (token: string, id: string) =>
    request<{ success: boolean }>(`/contractors/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getVehicleBrands: (token: string, params?: PaginationParams) =>
    request<PaginatedResponse<VehicleBrand>>(
      `/vehicle-brands${toQuery(params)}`,
      { headers: authHeaders(token) },
    ),

  createVehicleBrand: (token: string, payload: CreateVehicleBrandPayload) =>
    request<VehicleBrand>('/vehicle-brands', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  updateVehicleBrand: (token: string, id: string, payload: UpdateVehicleBrandPayload) =>
    request<VehicleBrand>(`/vehicle-brands/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteVehicleBrand: (token: string, id: string) =>
    request<{ message: string }>(`/vehicle-brands/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getVehicleModels: (token: string, params?: PaginationParams) =>
    request<PaginatedResponse<VehicleModel>>(
      `/vehicle-models${toQuery(params)}`,
      { headers: authHeaders(token) },
    ),

  createVehicleModel: (token: string, payload: CreateVehicleModelPayload) =>
    request<VehicleModel>('/vehicle-models', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  updateVehicleModel: (token: string, id: string, payload: UpdateVehicleModelPayload) =>
    request<VehicleModel>(`/vehicle-models/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteVehicleModel: (token: string, id: string) =>
    request<{ message: string }>(`/vehicle-models/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getVehicleColors: (token: string, params?: PaginationParams) =>
    request<PaginatedResponse<VehicleColor>>(
      `/vehicle-colors${toQuery(params)}`,
      { headers: authHeaders(token) },
    ),

  createVehicleColor: (token: string, payload: CreateVehicleColorPayload) =>
    request<VehicleColor>('/vehicle-colors', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  updateVehicleColor: (token: string, id: string, payload: UpdateVehicleColorPayload) =>
    request<VehicleColor>(`/vehicle-colors/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteVehicleColor: (token: string, id: string) =>
    request<{ message: string }>(`/vehicle-colors/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getSpareParts: (token: string, params?: PaginationParams) =>
    request<PaginatedResponse<SparePart>>(
      `/spare-parts${toQuery(params)}`,
      { headers: authHeaders(token) },
    ),

  createSparePart: (token: string, payload: CreateSparePartPayload) =>
    request<SparePart>('/spare-parts', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  updateSparePart: (token: string, id: string, payload: UpdateSparePartPayload) =>
    request<SparePart>(`/spare-parts/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteSparePart: (token: string, id: string) =>
    request<{ success: boolean }>(`/spare-parts/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  importSpareParts: (token: string, names: string[]) =>
    request<SparePartImportResult>('/spare-parts/import', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ names }),
    }),

  importSparePartsFile: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/spare-parts/import/file`, {
      method: 'POST',
      headers: authHeaders(token),
      body: formData,
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      const payload = (data ?? {}) as { message?: string | string[] };
      const message =
        typeof payload.message === 'string'
          ? payload.message
          : Array.isArray(payload.message)
            ? payload.message[0]
            : response.status === 404
              ? 'Import API not found. Restart the backend server and try again.'
              : `Import failed (${response.status})`;
      throw new ApiError(message, response.status);
    }

    return data as SparePartImportResult;
  },

  getInvestigations: (token: string, params?: PaginationParams) =>
    request<PaginatedResponse<Investigation>>(
      `/investigations${toQuery(params)}`,
      { headers: authHeaders(token) },
    ),

  getInvestigation: (token: string, id: string) =>
    request<Investigation>(`/investigations/${id}`, {
      headers: authHeaders(token),
    }),

  createInvestigation: (token: string, payload: CreateInvestigationPayload) =>
    request<Investigation>('/investigations', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  uploadInvestigationImage: async (token: string, id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_BASE_URL}/investigations/${id}/images`,
      {
        method: 'POST',
        headers: authHeaders(token),
        body: formData,
      },
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        typeof data.message === 'string'
          ? data.message
          : Array.isArray(data.message)
            ? data.message[0]
            : 'Failed to upload image';
      throw new ApiError(message, response.status);
    }
    return data as Investigation;
  },

  deleteInvestigation: (token: string, id: string) =>
    request<{ success: boolean }>(`/investigations/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getEstimates: (token: string, params?: PaginationParams) =>
    request<PaginatedResponse<Estimate>>(
      `/estimates${toQuery(params)}`,
      { headers: authHeaders(token) },
    ),

  getEstimate: (token: string, id: string) =>
    request<Estimate>(`/estimates/${id}`, {
      headers: authHeaders(token),
    }),

  getEstimateByInvestigation: async (token: string, investigationId: string) => {
    const estimate = await request<Estimate | null>(
      `/estimates/by-investigation/${investigationId}`,
      { headers: authHeaders(token) },
    );
    return estimate?.id ? estimate : null;
  },

  createEstimate: (token: string, payload: CreateEstimatePayload) =>
    request<Estimate>('/estimates', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  updateEstimate: (token: string, id: string, payload: UpdateEstimatePayload) =>
    request<Estimate>(`/estimates/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteEstimate: (token: string, id: string) =>
    request<{ success: boolean }>(`/estimates/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getJobCards: (token: string, params?: PaginationParams) =>
    request<PaginatedResponse<JobCard>>(
      `/job-cards${toQuery(params)}`,
      { headers: authHeaders(token) },
    ),

  getJobCard: (token: string, id: string) =>
    request<JobCard>(`/job-cards/${id}`, {
      headers: authHeaders(token),
    }),

  getJobCardByEstimate: async (token: string, estimateId: string) => {
    const card = await request<JobCard | null>(
      `/job-cards/by-estimate/${estimateId}`,
      { headers: authHeaders(token) },
    );
    return card ?? null;
  },

  createJobCard: (token: string, estimateId: string) =>
    request<JobCard>('/job-cards', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ estimateId }),
    }),

  updateJobCard: (token: string, id: string, payload: UpdateJobCardPayload) =>
    request<JobCard>(`/job-cards/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),
};

export type ActiveStatus = 'active' | 'inactive';

export interface Customer {
  id: string;
  name: string;
  mobileNumber: string;
  vatTrnNumber: string;
  email: string | null;
  phoneNumber: string | null;
  crtnNumber: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  name: string;
  mobileNumber: string;
  vatTrnNumber: string;
  email?: string;
  phoneNumber?: string;
  crtnNumber?: string;
  address?: string;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export interface Supplier {
  id: string;
  name: string;
  mobileNumber: string;
  trnNumber: string;
  address: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierPayload {
  name: string;
  mobileNumber: string;
  trnNumber: string;
  address: string;
  email?: string;
}

export type UpdateSupplierPayload = Partial<CreateSupplierPayload>;

export interface Contractor {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractorPayload {
  name: string;
}

export type UpdateContractorPayload = Partial<CreateContractorPayload>;

export interface VehicleBrand {
  id: string;
  name: string;
  logoUrl: string | null;
  status: ActiveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleBrandPayload {
  name: string;
  status: ActiveStatus;
  logoUrl?: string;
}

export type UpdateVehicleBrandPayload = Partial<CreateVehicleBrandPayload>;

export interface VehicleModel {
  id: string;
  brandId: string;
  name: string;
  brand?: VehicleBrand;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleModelPayload {
  brandId: string;
  name: string;
}

export type UpdateVehicleModelPayload = Partial<CreateVehicleModelPayload>;

export interface VehicleColor {
  id: string;
  name: string;
  hexCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleColorPayload {
  name: string;
  hexCode: string;
}

export type UpdateVehicleColorPayload = Partial<CreateVehicleColorPayload>;

export type SparePartCategory = 'supplier' | 'in-house';

export interface SparePart {
  id: string;
  name: string;
  partNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSparePartPayload {
  name: string;
  partNumber?: string;
}

export type UpdateSparePartPayload = Partial<CreateSparePartPayload>;

export interface SparePartImportResult {
  added: number;
  skippedDuplicates: number;
  skippedEmpty: number;
  skippedExisting: number;
}

export interface Investigation {
  id: string;
  customerId: string;
  customer: Customer;
  brandId: string;
  brand: VehicleBrand;
  modelId: string;
  model: VehicleModel;
  colorId: string;
  color: VehicleColor;
  makeYear: number;
  plateNo: string;
  chassisNumber: string;
  mileage: number;
  state: string;
  registrationExpiry: string;
  note: string | null;
  damagedZones: string[];
  imageUrls: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type JobCategory = 'regular' | 'insurance';

export interface EstimateSparePart {
  id: string;
  estimateId: string;
  name: string;
  partNumber: string | null;
  quantity: number;
  unitPrice: string;
  category: SparePartCategory;
  createdAt: string;
}

export interface Estimate {
  id: string;
  investigationId: string;
  investigation: Investigation;
  estimatedDeliveryDays: number;
  jobCategory: JobCategory;
  lumpSumAmount: string | null;
  status: string;
  spareParts: EstimateSparePart[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEstimateSparePartPayload {
  name: string;
  partNumber?: string;
  quantity: number;
  unitPrice?: number;
  category: SparePartCategory;
}

export interface CreateEstimatePayload {
  investigationId: string;
  estimatedDeliveryDays: number;
  jobCategory: JobCategory;
  lumpSumAmount?: number | null;
  spareParts: CreateEstimateSparePartPayload[];
}

export interface UpdateEstimatePayload {
  estimatedDeliveryDays?: number;
  jobCategory?: JobCategory;
  lumpSumAmount?: number | null;
  spareParts?: CreateEstimateSparePartPayload[];
}

export type JobCardStatus = 'in_progress' | 'completed';

export interface JobCardLine {
  id: string;
  jobCardId: string;
  estimateSparePartId: string | null;
  name: string;
  partNumber: string | null;
  quantity: number;
  category: SparePartCategory;
  unitCost: string;
  unitPrice: string;
  supplierId: string | null;
  supplier?: Supplier | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface JobCard {
  id: string;
  estimateId: string;
  estimate: Estimate;
  status: JobCardStatus;
  lpoNumber: string | null;
  contractorId: string | null;
  contractor?: Contractor | null;
  lines: JobCardLine[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateJobCardLinePayload {
  id: string;
  unitCost?: number;
  unitPrice?: number;
  supplierId?: string | null;
  category?: SparePartCategory;
  isCompleted?: boolean;
}

export interface UpdateJobCardPayload {
  status?: JobCardStatus;
  lpoNumber?: string | null;
  contractorId?: string | null;
  lines?: UpdateJobCardLinePayload[];
}

export interface CreateInvestigationPayload {
  customer: {
    customerId?: string;
    name?: string;
    mobileNumber?: string;
    vatTrnNumber?: string;
    email?: string;
    phoneNumber?: string;
    crtnNumber?: string;
    address?: string;
  };
  brandId: string;
  modelId: string;
  colorId: string;
  makeYear: number;
  plateNo: string;
  chassisNumber: string;
  mileage: number;
  state: string;
  registrationExpiry: string;
  note?: string;
  damagedZones?: string[];
  imageUrls?: string[];
}
