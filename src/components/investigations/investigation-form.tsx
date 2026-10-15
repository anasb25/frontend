'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Car,
  ClipboardList,
  Hash,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Save,
  UserRound,
  X,
} from 'lucide-react';
import { AlertModal } from '@/components/ui/alert-modal';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { CreatableSearchableSelect } from '@/components/ui/creatable-searchable-select';
import { FormStepper, FormStep } from '@/components/ui/form-stepper';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { YearPicker } from '@/components/ui/year-picker';
import { CarDamageDiagram } from '@/components/investigations/car-damage-diagram';
import { FormField } from '@/components/users/form-field';
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { useAuth } from '@/context/auth-context';
import {
  api,
  ApiError,
  Customer,
  VehicleBrand,
  VehicleColor,
  VehicleModel,
} from '@/lib/api';

const UAE_STATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
].map((name) => ({ value: name, label: name }));

const STEPS: FormStep[] = [
  {
    id: 'customer',
    label: 'Customer Information',
    shortLabel: 'Customer',
    icon: UserRound,
  },
  {
    id: 'vehicle',
    label: 'Vehicle Details',
    shortLabel: 'Vehicle',
    icon: Car,
  },
];

export function InvestigationForm() {
  const router = useRouter();
  const { token } = useAuth();

  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [colors, setColors] = useState<VehicleColor[]>([]);

  const [customerId, setCustomerId] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [vatTrnNumber, setVatTrnNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [crtnNumber, setCrtnNumber] = useState('');
  const [address, setAddress] = useState('');

  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [colorId, setColorId] = useState('');
  const [makeYear, setMakeYear] = useState<number | ''>('');
  const [plateNo, setPlateNo] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [mileage, setMileage] = useState('');
  const [state, setState] = useState('');
  const [registrationExpiry, setRegistrationExpiry] = useState('');
  const [note, setNote] = useState('');
  const [damagedZones, setDamagedZones] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [addModelOpen, setAddModelOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [addingModel, setAddingModel] = useState(false);

  const [savedInvestigationId, setSavedInvestigationId] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerLocked = Boolean(customerId) && !isNewCustomer;
  const isLastStep = step === STEPS.length - 1;

  const loadMasters = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [customersRes, brandsRes, colorsRes] = await Promise.all([
        api.getCustomers(token, { page: 1, limit: 100 }),
        api.getVehicleBrands(token, { page: 1, limit: 100, status: 'active' }),
        api.getVehicleColors(token, { page: 1, limit: 100 }),
      ]);
      setCustomers(customersRes.data);
      setBrands(brandsRes.data);
      setColors(colorsRes.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load master data');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMasters();
  }, [loadMasters]);

  useEffect(() => {
    if (!token || !brandId) {
      setModels([]);
      setModelId('');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await api.getVehicleModels(token, {
          page: 1,
          limit: 100,
          brandId,
        });
        if (!cancelled) {
          setModels(result.data);
          setModelId('');
        }
      } catch {
        if (!cancelled) setModels([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, brandId]);

  useEffect(() => {
    const urls = pendingFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [pendingFiles]);

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        value: customer.id,
        label: customer.name,
        description: customer.mobileNumber,
      })),
    [customers],
  );

  const brandOptions = useMemo(
    () =>
      brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
        icon: <BrandLogo name={brand.name} logoUrl={brand.logoUrl} size="xs" />,
      })),
    [brands],
  );

  const modelOptions = useMemo(
    () => models.map((model) => ({ value: model.id, label: model.name })),
    [models],
  );

  const colorOptions = useMemo(
    () =>
      colors.map((color) => ({
        value: color.id,
        label: color.name,
        icon: <ColorSwatch hexCode={color.hexCode} name={color.name} size="sm" />,
      })),
    [colors],
  );

  const fillCustomer = (customer: Customer) => {
    setCustomerId(customer.id);
    setIsNewCustomer(false);
    setCustomerName(customer.name);
    setMobileNumber(customer.mobileNumber);
    setVatTrnNumber(customer.vatTrnNumber);
    setEmail(customer.email ?? '');
    setPhoneNumber(customer.phoneNumber ?? '');
    setCrtnNumber(customer.crtnNumber ?? '');
    setAddress(customer.address ?? '');
  };

  const clearCustomerFields = (name = '') => {
    setCustomerId('');
    setIsNewCustomer(true);
    setCustomerName(name);
    setMobileNumber('');
    setVatTrnNumber('');
    setEmail('');
    setPhoneNumber('');
    setCrtnNumber('');
    setAddress('');
  };

  const validateCustomerStep = () => {
    if (!customerName.trim()) {
      setError('Customer name is required.');
      return false;
    }
    if (isNewCustomer || !customerId) {
      if (!mobileNumber.trim() || !vatTrnNumber.trim()) {
        setError('For a new customer, mobile number and VAT TRN # are required.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const validateVehicleStep = () => {
    if (!brandId || !modelId || !colorId) {
      setError('Please select brand, model, and color.');
      return false;
    }
    if (!makeYear) {
      setError('Make year is required.');
      return false;
    }
    if (!plateNo.trim() || !chassisNumber.trim() || !state || !registrationExpiry) {
      setError('Plate no, chassis number, state, and registration expiry are required.');
      return false;
    }
    setError('');
    return true;
  };

  const goNext = () => {
    if (step === 0 && !validateCustomerStep()) return;
    setError('');
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError('');
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleAddModel = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !brandId || !newModelName.trim()) return;

    setAddingModel(true);
    setError('');
    try {
      const created = await api.createVehicleModel(token, {
        brandId,
        name: newModelName.trim(),
      });
      setModels((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setModelId(created.id);
      setNewModelName('');
      setAddModelOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add model');
    } finally {
      setAddingModel(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !isLastStep) return;

    if (!validateCustomerStep()) {
      setStep(0);
      return;
    }
    if (!validateVehicleStep()) return;

    setIsSubmitting(true);
    setError('');
    try {
      const created = await api.createInvestigation(token, {
        customer:
          customerId && !isNewCustomer
            ? { customerId }
            : {
                name: customerName.trim(),
                mobileNumber: mobileNumber.trim(),
                vatTrnNumber: vatTrnNumber.trim(),
                email: email.trim() || undefined,
                phoneNumber: phoneNumber.trim() || undefined,
                crtnNumber: crtnNumber.trim() || undefined,
                address: address.trim() || undefined,
              },
        brandId,
        modelId,
        colorId,
        makeYear: makeYear as number,
        plateNo: plateNo.trim(),
        chassisNumber: chassisNumber.trim(),
        mileage: Number(mileage) || 0,
        state,
        registrationExpiry,
        note: note.trim() || undefined,
        damagedZones,
      });

      for (const file of pendingFiles) {
        await api.uploadInvestigationImage(token, created.id, file);
      }

      setSavedInvestigationId(created.id);
      setSuccessModalOpen(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save investigation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToEstimate = () => {
    if (!savedInvestigationId) return;
    setSuccessModalOpen(false);
    router.push(`/dashboard/estimates/new?investigationId=${savedInvestigationId}`);
  };

  const handleCancelAfterSave = () => {
    setSuccessModalOpen(false);
    router.push('/dashboard/investigations');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-4"
      >
        <div className="rounded-2xl border border-[var(--shell-border)] bg-gradient-to-br from-primary/5 via-card to-cyan-500/5 p-4 shadow-sm">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Workflow · Step 1 of 2
            </p>
            <h2 className="text-base font-bold tracking-tight">Investigation</h2>
          </div>
          <FormStepper
            steps={STEPS}
            currentStep={step}
            onStepClick={(index) => {
              if (index < step) {
                setStep(index);
                setError('');
                return;
              }
              if (index === 1 && step === 0) goNext();
            }}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="modern-card overflow-hidden rounded-2xl border border-[var(--shell-border)] bg-card shadow-sm">
          <div className="border-b border-[var(--shell-border)] bg-[var(--surface)]/40 px-4 py-3">
            <p className="text-base font-bold tracking-tight text-foreground">{STEPS[step].label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {step === 0 &&
                'Select an existing customer or type a new name to create one.'}
              {step === 1 &&
                'Vehicle details, damage mapping, and photos.'}
            </p>
          </div>

          <div className="p-4">
            {step === 0 && (
              <div className="space-y-4">
                <FormField label="Customer Name *" htmlFor="customerName">
                  <CreatableSearchableSelect
                    id="customerName"
                    value={customerId || customerName}
                    options={customerOptions}
                    placeholder="Search or add customer name"
                    onChange={(value, meta) => {
                      if (meta.isNew) {
                        clearCustomerFields(value);
                        return;
                      }
                      const customer = customers.find((item) => item.id === value);
                      if (customer) fillCustomer(customer);
                    }}
                  />
                </FormField>

                {isNewCustomer && (
                  <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                    New customer — fill required fields. They will be saved when you submit.
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Mobile Number *" htmlFor="mobileNumber">
                    <Input
                      id="mobileNumber"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      disabled={customerLocked}
                      className="h-9"
                      required={isNewCustomer || !customerId}
                    />
                  </FormField>
                  <FormField label="VAT TRN # *" htmlFor="vatTrnNumber">
                    <Input
                      id="vatTrnNumber"
                      value={vatTrnNumber}
                      onChange={(e) => setVatTrnNumber(e.target.value)}
                      disabled={customerLocked}
                      className="h-9"
                      required={isNewCustomer || !customerId}
                    />
                  </FormField>
                  <FormField label="Email" htmlFor="email">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={customerLocked}
                      className="h-9"
                    />
                  </FormField>
                  <FormField label="Phone Number" htmlFor="phoneNumber">
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={customerLocked}
                      className="h-9"
                    />
                  </FormField>
                  <FormField label="CRTN #" htmlFor="crtnNumber">
                    <Input
                      id="crtnNumber"
                      value={crtnNumber}
                      onChange={(e) => setCrtnNumber(e.target.value)}
                      disabled={customerLocked}
                      className="h-9"
                    />
                  </FormField>
                  <FormField label="Address" htmlFor="address">
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={customerLocked}
                      className="h-9"
                    />
                  </FormField>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(260px,1fr)_minmax(220px,280px)]">
                <div className="space-y-4 md:col-span-2 xl:col-span-1">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <FormField label="Vehicle Brand *" htmlFor="brandId">
                      <SearchableSelect
                        id="brandId"
                        value={brandId}
                        onChange={setBrandId}
                        options={brandOptions}
                        placeholder="Search brand"
                        size="sm"
                      />
                    </FormField>

                    <div className="space-y-2 sm:col-span-1">
                      <FormField label="Vehicle Model *" htmlFor="modelId">
                        <SearchableSelect
                          id="modelId"
                          value={modelId}
                          onChange={setModelId}
                          options={modelOptions}
                          placeholder={brandId ? 'Search model' : 'Select brand first'}
                          disabled={!brandId}
                          size="sm"
                        />
                      </FormField>
                      {brandId && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setAddModelOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                          {models.length === 0 ? 'Add first model' : 'Add model'}
                        </Button>
                      )}
                    </div>

                    <FormField label="Vehicle Color *" htmlFor="colorId">
                      <SearchableSelect
                        id="colorId"
                        value={colorId}
                        onChange={setColorId}
                        options={colorOptions}
                        placeholder="Search color"
                        size="sm"
                      />
                    </FormField>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <FormField label="Make Year *" htmlFor="makeYear">
                      <YearPicker id="makeYear" value={makeYear} onChange={setMakeYear} />
                    </FormField>
                    <FormField
                      label="Plate No *"
                      htmlFor="plateNo"
                      icon={<Hash className="h-3.5 w-3.5" />}
                    >
                      <Input
                        id="plateNo"
                        value={plateNo}
                        onChange={(e) => setPlateNo(e.target.value)}
                        className="h-9 pl-10 uppercase"
                        required
                      />
                    </FormField>
                    <FormField label="Chassis Number *" htmlFor="chassisNumber">
                      <Input
                        id="chassisNumber"
                        value={chassisNumber}
                        onChange={(e) => setChassisNumber(e.target.value)}
                        className="h-9 uppercase"
                        required
                      />
                    </FormField>
                    <FormField label="Mileage (kms)" htmlFor="mileage">
                      <Input
                        id="mileage"
                        type="number"
                        min={0}
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                        className="h-9"
                      />
                    </FormField>
                    <FormField
                      label="State *"
                      htmlFor="state"
                      icon={<MapPin className="h-3.5 w-3.5" />}
                    >
                      <SearchableSelect
                        id="state"
                        value={state}
                        onChange={setState}
                        options={UAE_STATES}
                        placeholder="Select emirate"
                        size="sm"
                      />
                    </FormField>
                    <FormField label="Registration Expiry *" htmlFor="registrationExpiry">
                      <DatePicker
                        id="registrationExpiry"
                        value={registrationExpiry}
                        onChange={setRegistrationExpiry}
                        placeholder="Select expiry date"
                        size="sm"
                      />
                    </FormField>
                  </div>

                  <FormField label="Note" htmlFor="note">
                    <Textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Additional notes..."
                      className="min-h-[72px]"
                    />
                  </FormField>
                </div>

                <div className="space-y-2 rounded-xl border border-[var(--shell-border)] p-3 xl:sticky xl:top-4 xl:self-start">
                  <p className="text-xs font-semibold text-foreground">Damage Map</p>
                  <CarDamageDiagram
                    selected={damagedZones}
                    onChange={setDamagedZones}
                    compact
                  />
                </div>

                <div className="space-y-2 rounded-xl border border-[var(--shell-border)] p-3 xl:sticky xl:top-4 xl:self-start">
                    <p className="text-xs font-semibold text-foreground">Photos</p>
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--shell-border)] bg-[var(--surface)]/50 px-3 py-5 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
                      <ImagePlus className="h-5 w-5 text-primary" />
                      <span className="text-xs font-medium">Upload images</span>
                      <span className="text-[10px] text-muted-foreground">PNG, JPG up to 8MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          if (files.length) {
                            setPendingFiles((current) => [...current, ...files]);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>

                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {previewUrls.map((url, index) => (
                          <div
                            key={url}
                            className="relative overflow-hidden rounded-lg border border-[var(--shell-border)]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="h-20 w-full object-cover" />
                            <button
                              type="button"
                              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                              onClick={() =>
                                setPendingFiles((current) =>
                                  current.filter((_, i) => i !== index),
                                )
                              }
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-[var(--shell-border)] bg-[var(--surface)]/30 px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={step === 0}
              className={step === 0 ? 'invisible' : ''}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {isLastStep ? (
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Investigation
                  </>
                )}
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={goNext}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>

      <AlertModal
        open={successModalOpen}
        onClose={handleCancelAfterSave}
        variant="success"
        title="Investigation Saved"
        description="Your investigation was saved successfully. What would you like to do next?"
        closeOnBackdrop={false}
        primaryAction={{
          label: 'Continue to Estimate',
          onClick: handleContinueToEstimate,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: handleCancelAfterSave,
        }}
      />

      <Modal open={addModelOpen} onClose={() => setAddModelOpen(false)}>
        <form onSubmit={handleAddModel}>
          <ModalHeader>
            <ModalTitle>Add Vehicle Model</ModalTitle>
            <ModalDescription>
              Create a model under the selected brand.
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <FormField label="Model Name" htmlFor="newModelName">
              <Input
                id="newModelName"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="Camry, Patrol..."
                required
              />
            </FormField>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setAddModelOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addingModel}>
              {addingModel ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4" />
                  Add Model
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
