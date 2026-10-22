import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Mail,
  Lock,
  Download,
  Trash2,
  CheckCircle,
  HelpCircle,
  Layers,
  Shield,
  CreditCard,
  Zap,
} from 'lucide-react';
import {
  CardBox,
  Checkbox,
  ConfirmModal,
  CustomButton,
  DataTable,
  FileInput,
  Modal,
  Preloader,
  RadioButtonInput,
  Select2,
  SelectInput,
  SpinLoader,
  TextInput,
  Textarea,
  ToggleTheme,
  type Column,
  type RadioOption,
  type Select2Option,
  type SpinColor,
  type SpinSize,
} from '@/components/ui';
import { Summernote } from '@/components/ui/Summernote'; // heavy (jQuery) – import directly
import { useToast } from '@/contexts/ToastContext';

// ─── Static demo data (kept outside the component so it is created once) ───

// Sample data for DataTable
interface SampleEmployee {
  id: number;
  name: string;
  role: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Review';
  salary: number;
}

const sampleEmployees: SampleEmployee[] = [
  { id: 101, name: 'Elena Rostova', role: 'Principal Architect', department: 'Platform Core', status: 'Active', salary: 185000 },
  { id: 102, name: 'Marcus Vance', role: 'Frontend Lead', department: 'UI Engineering', status: 'Active', salary: 165000 },
  { id: 103, name: 'Sofia Rodriguez', role: 'Security Analyst', department: 'SecOps', status: 'Review', salary: 142000 },
  { id: 104, name: 'Julian Hayes', role: 'Product Strategist', department: 'Growth', status: 'Active', salary: 155000 },
  { id: 105, name: 'Amina Idris', role: 'DevOps Engineer', department: 'Infrastructure', status: 'On Leave', salary: 148000 },
  { id: 106, name: 'Lucas Meyer', role: 'Design Systems', department: 'UI Engineering', status: 'Active', salary: 138000 },
  { id: 107, name: 'Chloe Dubois', role: 'QA Automation', department: 'Quality Lab', status: 'Active', salary: 125000 },
];

const tableColumns: Column<SampleEmployee>[] = [
  { key: 'id', header: 'ID', sortable: true, width: '70px' },
  {
    key: 'name',
    header: 'Employee Name',
    sortable: true,
    render: (row) => (
      <div>
        <span className="font-semibold text-slate-900 dark:text-slate-100">{row.name}</span>
        <span className="block text-[11px] text-slate-400">{row.role}</span>
      </div>
    ),
  },
  { key: 'department', header: 'Department', sortable: true },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (row) => {
      const colors = {
        Active: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
        'On Leave': 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
        Review: 'text-sky-700 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400',
      };
      return (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${colors[row.status]}`}>
          {row.status}
        </span>
      );
    },
  },
  {
    key: 'salary',
    header: 'Base Compensation',
    sortable: true,
    align: 'right',
    render: (row) => (
      <span className="font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
        ${row.salary.toLocaleString()}
      </span>
    ),
  },
];

const select2Options: Select2Option[] = [
  { value: 'react', label: 'React 19', description: 'Component architecture with Hooks', badge: 'v19' },
  { value: 'typescript', label: 'TypeScript', description: 'Static typing & modern IntelliSense', badge: 'v5' },
  { value: 'tailwind', label: 'Tailwind CSS', description: 'Utility-first modern styling engine', badge: 'v4' },
  { value: 'vite', label: 'Vite 8', description: 'Next-generation lightning frontend build tool', badge: 'v8' },
  { value: 'axios', label: 'Axios Client', description: 'Promise-based HTTP client with interceptors', badge: 'v1.x' },
];

const radioCardOptions: RadioOption[] = [
  {
    value: 'standard',
    label: 'Standard Plan',
    description: 'Ideal for prototyping, personal sandboxes, and hobby apps.',
    badge: '$19/mo',
    icon: <Layers className="w-4 h-4 text-indigo-500" />,
  },
  {
    value: 'pro',
    label: 'Professional Tier',
    description: 'Production workloads with automated backups and 24/7 priority alerts.',
    badge: '$79/mo',
    icon: <Zap className="w-4 h-4 text-amber-500" />,
  },
  {
    value: 'enterprise',
    label: 'Enterprise Dedicated',
    description: 'Custom SLAs, multi-region clusters, and dedicated support engineering.',
    badge: 'Custom',
    icon: <Shield className="w-4 h-4 text-emerald-500" />,
  },
];

export const AllComponentsPage: React.FC = () => {
  const { toast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'all' | 'buttons' | 'forms' | 'feedback' | 'data' | 'overlays' | 'richtext'>('all');

  // FileInput state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [editorContent, setEditorContent] = useState<string>(
    '<h3>Summernote Rich Text Editor</h3><p>This is a full-featured <strong>WYSIWYG editor</strong> created for your React template. You can highlight text, add <em>italic</em>, <u>underline</u>, blockquotes, lists, links, tables, and toggle raw HTML code view!</p>'
  );

  // Button loading states
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  // Form states
  const [textValue, setTextValue] = useState('John Doe');
  const [passwordValue, setPasswordValue] = useState('secret1234');
  const [textareaValue, setTextareaValue] = useState('This is a customizable textarea component with dynamic character counting.');
  const [selectValue, setSelectValue] = useState('react');
  const [select2Single, setSelect2Single] = useState('tailwind');
  const [select2Multi, setSelect2Multi] = useState<string[]>(['react', 'typescript']);
  const [radioSimple, setRadioSimple] = useState('standard');
  const [radioCard, setRadioCard] = useState('pro');
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [indeterminateChecked, setIndeterminateChecked] = useState(false);

  // Modal states
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Preloader state
  const [showPreloader, setShowPreloader] = useState(false);

  // CardBox loading state
  const [cardLoading, setCardLoading] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Fullscreen Preloader trigger simulator */}
      {showPreloader && (
        <Preloader
          isLoading={showPreloader}
          showProgress={true}
          duration={1500}
          onComplete={() => {
            setShowPreloader(false);
            toast.success('Preloader completed successfully!');
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Component Showcase & Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Every requested component implemented with responsive states, accessibility, and dark mode support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ToggleTheme variant="segmented" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
        {[
          { id: 'all', label: 'All Components' },
          { id: 'richtext', label: 'Summernote & Files' },
          { id: 'buttons', label: 'Buttons & Loaders' },
          { id: 'forms', label: 'Form Controls' },
          { id: 'feedback', label: 'Toasts & Alerts' },
          { id: 'data', label: 'Data Table & Cards' },
          { id: 'overlays', label: 'Modals & Dialogs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: CUSTOM BUTTON & LOADING */}
      {(activeTab === 'all' || activeTab === 'buttons') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                1. CustomButton with Loading State
              </h2>
              <p className="text-xs text-slate-500">
                Supports variants (primary, secondary, outline, ghost, danger, success), sizes, and inline spinner loading.
              </p>
            </div>
            <CustomButton
              variant="outline"
              size="xs"
              onClick={() => setIsBtnLoading((prev) => !prev)}
            >
              Toggle Loading State: {isBtnLoading ? 'ON' : 'OFF'}
            </CustomButton>
          </div>

          <CardBox variant="default">
            <div className="space-y-5">
              {/* Variants */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Button Variants
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <CustomButton variant="primary" isLoading={isBtnLoading}>
                    Primary Action
                  </CustomButton>
                  <CustomButton variant="secondary" isLoading={isBtnLoading}>
                    Secondary
                  </CustomButton>
                  <CustomButton variant="outline" isLoading={isBtnLoading}>
                    Outline
                  </CustomButton>
                  <CustomButton variant="ghost" isLoading={isBtnLoading}>
                    Ghost
                  </CustomButton>
                  <CustomButton variant="danger" isLoading={isBtnLoading}>
                    Danger
                  </CustomButton>
                  <CustomButton variant="success" isLoading={isBtnLoading}>
                    Success
                  </CustomButton>
                </div>
              </div>

              {/* Sizes & Icons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Sizes & Icon Affordances
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <CustomButton size="xs" variant="primary" leftIcon={<Sparkles className="w-3 h-3" />}>
                    Size XS
                  </CustomButton>
                  <CustomButton size="sm" variant="secondary" leftIcon={<Mail className="w-3.5 h-3.5" />}>
                    Size SM
                  </CustomButton>
                  <CustomButton size="md" variant="primary" rightIcon={<Download className="w-4 h-4" />}>
                    Size MD
                  </CustomButton>
                  <CustomButton size="lg" variant="primary">
                    Size LG
                  </CustomButton>
                  <CustomButton size="sm" variant="danger" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                    Delete Record
                  </CustomButton>
                </div>
              </div>
            </div>
          </CardBox>
        </section>
      )}

      {/* SECTION 2: SPINLOADER & PRELOADER */}
      {(activeTab === 'all' || activeTab === 'buttons' || activeTab === 'feedback') && (
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              2. SpinLoader & Preloader
            </h2>
            <p className="text-xs text-slate-500">
              Inline animated spin loaders (sizes xs-xl, ring/dots/pulse) and full-screen application preloader.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardBox title="SpinLoader Types & Sizes">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-2">Spinner Sizes (Ring)</span>
                  <div className="flex items-center gap-4">
                    <SpinLoader size="xs" />
                    <SpinLoader size="sm" />
                    <SpinLoader size="md" />
                    <SpinLoader size="lg" />
                    <SpinLoader size="xl" />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block mb-2">Variants (Dots & Pulse)</span>
                  <div className="flex items-center gap-6">
                    <SpinLoader type="dots" label="Syncing..." />
                    <SpinLoader type="pulse" color="emerald" label="Live stream" />
                  </div>
                </div>
              </div>
            </CardBox>

            <CardBox title="Page Preloader">
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  The Preloader component provides full-screen or container loading screens with brand visuals, progress bars, and percentage timers.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <CustomButton
                    variant="primary"
                    size="sm"
                    onClick={() => setShowPreloader(true)}
                  >
                    Launch Fullscreen Preloader Demo
                  </CustomButton>
                </div>
              </div>
            </CardBox>
          </div>
        </section>
      )}

      {/* SECTION 3: FORM CONTROLS (TEXTINPUT, TEXTAREA, SELECTINPUT, SELECT2, RADIOBUTTON, CHECKBOX) */}
      {(activeTab === 'all' || activeTab === 'forms') && (
        <section className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              3. Form Inputs & Select Controls
            </h2>
            <p className="text-xs text-slate-500">
              TextInput, Textarea, SelectInput, Select2 (Combobox), RadioButtonInput, and Checkbox / Switch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TextInput Variants */}
            <CardBox title="TextInput Component">
              <div className="space-y-4">
                <TextInput
                  label="User Full Name"
                  placeholder="Enter full name..."
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  helperText="Supports clear button and custom icons"
                  isClearable
                  onClear={() => setTextValue('')}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <TextInput
                  label="Password Field"
                  type="password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  helperText="Click eye icon to toggle visibility"
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <TextInput
                  label="Domain Prefix / Suffix"
                  prefix="https://"
                  suffix=".com"
                  placeholder="mysite"
                  size="sm"
                />

                <TextInput
                  label="Input with Error Validation"
                  value="invalid_email_format"
                  readOnly
                  error="Please enter a valid business email address"
                  size="sm"
                />
              </div>
            </CardBox>

            {/* Textarea Component */}
            <CardBox title="Textarea Component">
              <div className="space-y-4">
                <Textarea
                  label="Project Scope & Notes"
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  maxLength={150}
                  showCharCount={true}
                  rows={4}
                  helperText="Character counter activates automatically"
                />

                <Textarea
                  label="Auto-Resizing Textarea"
                  placeholder="Type multiple lines to watch this box expand automatically..."
                  autoResize={true}
                  rows={2}
                  helperText="Dynamically resizes height based on text content"
                />
              </div>
            </CardBox>

            {/* SelectInput & Select2 (Combobox) */}
            <CardBox title="SelectInput & Select2 (Searchable Combobox)">
              <div className="space-y-5">
                {/* Standard native SelectInput */}
                <SelectInput
                  label="SelectInput (Native Styled Dropdown)"
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                  helperText="Native accessibility with custom chevron and styles"
                  options={[
                    { value: 'react', label: 'React Framework' },
                    { value: 'vue', label: 'Vue.js Framework' },
                    { value: 'angular', label: 'Angular Platform' },
                    { value: 'svelte', label: 'Svelte Engine' },
                  ]}
                />

                {/* Advanced Select2 Single Select */}
                <Select2
                  label="Select2 (Searchable Single-Select Combobox)"
                  options={select2Options}
                  value={select2Single}
                  onChange={(val) => setSelect2Single(val)}
                  placeholder="Choose primary framework..."
                  helperText="Live search filter with keyboard arrow navigation"
                />

                {/* Advanced Select2 Multi Select */}
                <Select2
                  label="Select2 (Multi-Select with Tag Badges)"
                  options={select2Options}
                  value={select2Multi}
                  onChange={(val) => setSelect2Multi(val)}
                  isMulti={true}
                  placeholder="Select technologies..."
                  helperText="Selected items appear as tags with individual remove buttons"
                />
              </div>
            </CardBox>

            {/* Checkbox, Switch & Radio Inputs */}
            <CardBox title="Checkbox, Switch & RadioButtonInput">
              <div className="space-y-5">
                {/* Checkboxes */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Checkboxes & Switches
                  </span>
                  <div className="space-y-3">
                    <Checkbox
                      label="Remember authentication credentials"
                      description="Saves session token securely in encrypted local store"
                      checked={checkboxChecked}
                      onChange={(e) => setCheckboxChecked(e.target.checked)}
                    />

                    <Checkbox
                      variant="switch"
                      label="Push Notifications & Real-Time Sync"
                      description="Receive immediate alerts for critical system events"
                      checked={switchChecked}
                      onChange={(e) => setSwitchChecked(e.target.checked)}
                    />

                    <Checkbox
                      label="Indeterminate Tri-State Checkbox"
                      indeterminate={indeterminateChecked}
                      checked={false}
                      onChange={() => setIndeterminateChecked((prev) => !prev)}
                      description="Click to toggle indeterminate state representation"
                    />
                  </div>
                </div>

                {/* Radio Simple */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <RadioButtonInput
                    name="simple-radio"
                    label="RadioButtonInput (Simple Orientation)"
                    value={radioSimple}
                    onChange={(val) => setRadioSimple(val)}
                    orientation="horizontal"
                    options={[
                      { value: 'standard', label: 'Standard Delivery' },
                      { value: 'express', label: 'Express Priority' },
                      { value: 'overnight', label: 'Overnight' },
                    ]}
                  />
                </div>
              </div>
            </CardBox>
          </div>

          {/* RadioButtonInput Rich Card Variant */}
          <CardBox title="RadioButtonInput (Rich Card Selector Variant)">
            <RadioButtonInput
              name="card-radio"
              label="Select Subscription Tier"
              variant="cards"
              value={radioCard}
              onChange={(val) => setRadioCard(val)}
              options={radioCardOptions}
            />
          </CardBox>
        </section>
      )}

      {/* SECTION 4: TOASTER NOTIFICATIONS */}
      {(activeTab === 'all' || activeTab === 'feedback') && (
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              4. Toaster Notification System
            </h2>
            <p className="text-xs text-slate-500">
              Toast dispatching with auto-dismiss progress bar, pause on hover, manual dismissal, and action buttons.
            </p>
          </div>

          <CardBox>
            <div className="flex flex-wrap items-center gap-3">
              <CustomButton
                variant="success"
                size="sm"
                onClick={() =>
                  toast.success('Your changes were successfully persisted to the database.', {
                    title: 'Record Saved',
                  })
                }
              >
                Trigger Success Toast
              </CustomButton>

              <CustomButton
                variant="danger"
                size="sm"
                onClick={() =>
                  toast.error('Could not authenticate with API endpoint. Invalid signature.', {
                    title: 'Authentication Failed',
                  })
                }
              >
                Trigger Error Toast
              </CustomButton>

              <CustomButton
                variant="secondary"
                size="sm"
                onClick={() =>
                  toast.warning('Your storage quota is currently at 88% capacity.', {
                    title: 'Storage Warning',
                  })
                }
              >
                Trigger Warning Toast
              </CustomButton>

              <CustomButton
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info('New software patch v1.0.4 is available.', {
                    title: 'Release Announcement',
                    action: {
                      label: 'View Changelog',
                      onClick: () => toast.success('Navigated to changelog!'),
                    },
                  })
                }
              >
                Toast with Action Button
              </CustomButton>
            </div>
          </CardBox>
        </section>
      )}

      {/* SECTION 5: MODAL & CONFIRM DIALOG */}
      {(activeTab === 'all' || activeTab === 'overlays') && (
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              5. Modal & Dialog Windows
            </h2>
            <p className="text-xs text-slate-500">
              Accessible dialog with backdrop blur, keyboard ESC close, scroll lock, multiple sizes, and preset confirm modals.
            </p>
          </div>

          <CardBox>
            <div className="flex flex-wrap items-center gap-3">
              <CustomButton
                variant="primary"
                size="sm"
                onClick={() => {
                  setModalSize('sm');
                  setIsBasicModalOpen(true);
                }}
              >
                Open Small Modal
              </CustomButton>

              <CustomButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setModalSize('md');
                  setIsBasicModalOpen(true);
                }}
              >
                Open Medium Modal
              </CustomButton>

              <CustomButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalSize('lg');
                  setIsBasicModalOpen(true);
                }}
              >
                Open Large Modal
              </CustomButton>

              <CustomButton
                variant="danger"
                size="sm"
                onClick={() => setIsConfirmModalOpen(true)}
              >
                Open Confirmation Dialog
              </CustomButton>
            </div>
          </CardBox>

          {/* Basic Modal */}
          <Modal
            isOpen={isBasicModalOpen}
            onClose={() => setIsBasicModalOpen(false)}
            size={modalSize}
            title={`Demonstration Modal (${modalSize.toUpperCase()})`}
            description="Accessible container with backdrop-blur and keyboard navigation."
            footer={
              <>
                <CustomButton variant="outline" size="sm" onClick={() => setIsBasicModalOpen(false)}>
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsBasicModalOpen(false);
                    toast.success('Modal action submitted!');
                  }}
                >
                  Confirm & Save
                </CustomButton>
              </>
            }
          >
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Background scrolling is locked while open. The modal will stay open if you click outside, until you explicitly click the cross (<kbd className="font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">✕</kbd>) or Cancel button.
              </p>
              <TextInput label="Modal Form Input" placeholder="Type here..." size="sm" />
            </div>
          </Modal>

          {/* Confirm Modal */}
          <ConfirmModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={() => {
              setIsConfirmModalOpen(false);
              toast.error('Item permanently deleted.');
            }}
            title="Delete User Record?"
            message="Are you sure you want to remove this employee from active rosters? This operation cannot be undone."
            confirmText="Yes, Delete"
            confirmVariant="danger"
          />
        </section>
      )}

      {/* SECTION 6: CARDBOX & DATATABLE */}
      {(activeTab === 'all' || activeTab === 'data') && (
        <section className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              6. CardBox & DataTable
            </h2>
            <p className="text-xs text-slate-500">
              CardBox (collapsible, loading overlay) and DataTable (sorting, filtering, pagination, selection, CSV export).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardBox
              title="CardBox with CustomButton in Header & Footer"
              subtitle="Right-aligned CustomButtons on both top and bottom edges"
              variant="default"
              headerAction={
                <CustomButton
                  size="xs"
                  variant="primary"
                  onClick={() => toast.info('Header CustomButton clicked!')}
                >
                  Header Action
                </CustomButton>
              }
              footer={
                <div className="flex items-center gap-2">
                  <CustomButton
                    size="xs"
                    variant="outline"
                    onClick={() => toast.warning('Cancelled changes')}
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    size="xs"
                    variant="success"
                    onClick={() => toast.success('Settings saved successfully!')}
                  >
                    Save Changes
                  </CustomButton>
                </div>
              }
            >
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This CardBox demonstrates <strong>CustomButton</strong> integrated in 2 locations: the header (top right) and the footer (bottom right), maintaining clean visual alignment across both edges.
              </p>
            </CardBox>

            <CardBox
              title="Card with Loading Overlay"
              subtitle="Toggle loading state with spinner"
              isLoading={cardLoading}
              headerAction={
                <CustomButton
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setCardLoading(true);
                    setTimeout(() => setCardLoading(false), 1500);
                  }}
                >
                  Simulate Reload
                </CustomButton>
              }
              footer={
                <CustomButton
                  size="xs"
                  variant="secondary"
                  onClick={() => toast.info('Refreshed card sync')}
                >
                  Quick Sync
                </CustomButton>
              }
            >
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Click the "Simulate Reload" CustomButton in the header to activate an overlay backdrop blur and spinner while content is re-fetching.
              </p>
            </CardBox>
          </div>

          {/* Full DataTable Demo */}
          <DataTable<SampleEmployee>
            title="Employee Directory & Compensation"
            columns={tableColumns}
            data={sampleEmployees}
            keyField="id"
            selectable={true}
            searchable={true}
            searchPlaceholder="Search by name, role, or department..."
            enableExport={true}
            exportFileName="employees-export"
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 20]}
            onSelectionChange={(selected) => {
              if (selected.length > 0) {
                // optional callback
              }
            }}
          />
        </section>
      )}

      {/* SECTION 7: SUMMERNOTE & FILEINPUT */}
      {(activeTab === 'all' || activeTab === 'richtext' || activeTab === 'forms') && (
        <section className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              7. Summernote (Rich Text Editor) & FileInput (Dropzone)
            </h2>
            <p className="text-xs text-slate-500">
              Full-featured WYSIWYG editor with headings, tables, links, images, code view, and drag-and-drop file uploader with previews.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summernote Editor Card */}
            <CardBox
              title="Summernote WYSIWYG Editor"
              subtitle="Rich text formatting, tables, HTML code view"
              headerAction={
                <CustomButton
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setEditorContent('<p><strong>Summernote</strong> reset to clean template state.</p>');
                    toast.info('Editor content reset');
                  }}
                >
                  Reset Content
                </CustomButton>
              }
              footer={
                <CustomButton
                  size="xs"
                  variant="primary"
                  onClick={() => {
                    toast.success('Rich text payload saved successfully!');
                  }}
                >
                  Publish Article
                </CustomButton>
              }
            >
              <div className="space-y-4">
                <Summernote
                  label="Document Body Content"
                  value={editorContent}
                  onChange={(html) => setEditorContent(html)}
                  height={220}
                  helperText="Switch to 'Code' mode to inspect raw HTML markup"
                />
              </div>
            </CardBox>

            {/* FileInput Card */}
            <CardBox
              title="FileInput Dropzone & Previews"
              subtitle="Drag-and-drop file upload with validation & chips"
              headerAction={
                <CustomButton
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setUploadedFiles([]);
                    toast.warning('Cleared uploaded files');
                  }}
                >
                  Clear Files
                </CustomButton>
              }
              footer={
                <CustomButton
                  size="xs"
                  variant="success"
                  onClick={() => {
                    if (uploadedFiles.length === 0) {
                      toast.warning('Please select at least 1 file to upload');
                    } else {
                      toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
                    }
                  }}
                >
                  Upload Files
                </CustomButton>
              }
            >
              <div className="space-y-4">
                <FileInput
                  label="Upload Attachments or Images"
                  accept="image/*,.pdf,.zip"
                  multiple={true}
                  maxSizeMB={15}
                  maxFiles={4}
                  onChange={(files) => setUploadedFiles(files)}
                  helperText="Accepted formats: PNG, JPG, PDF, ZIP (Max 15MB each)"
                />

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Compact Variant
                  </span>
                  <FileInput
                    variant="compact"
                    multiple={false}
                    accept=".pdf,.docx,.txt"
                    maxSizeMB={5}
                    helperText="Inline compact button style for modal forms"
                  />
                </div>
              </div>
            </CardBox>
          </div>
        </section>
      )}
    </div>
  );
};

export default AllComponentsPage;
