/**
 * Newsletter Kit - Component Library Entry Point
 * Complete React component library for newsletter subscriptions
 * 
 * @version 1.0.0
 */

// ========================= CORE COMPONENTS =========================
export {
  NewsletterProvider,
  useNewsletterConfig,
} from './NewsletterProvider';

export {
  NewsletterForm,
  NewsletterFormMinimal,
  NewsletterFormModern,
  NewsletterFormOutlined,
} from './NewsletterForm';

export {
  NewsletterModal,
  NewsletterModalSimple,
  NewsletterModalModern,
  NewsletterModalPromo,
  NewsletterModalTrigger,
  useNewsletterModal,
} from './NewsletterModal';

export {
  NewsletterToast,
  NewsletterToastSuccess,
  NewsletterToastError,
  NewsletterToastContainer,
  useNewsletterToast,
  showNewsletterToast,
} from './NewsletterToast';

// ========================= TYPE EXPORTS =========================
export type {
  NewsletterProviderProps,
  SubscriptionFormProps,
  SubscriptionModalProps,
  SubscriptionToastProps,
  UseNewsletterModalReturn,
  UseNewsletterToastReturn,
  NewsletterModalTriggerProps,
  NewsletterToastContainerProps,
} from '../types';

// ========================= CONVENIENCE EXPORTS =========================

/**
 * Newsletter Kit Bundle - All components in one import
 * 
 * @example
 * ```tsx
 * import { NewsletterKit } from '@/lib/newsletter-kit';
 * 
 * const { Provider, Form, Modal, Toast } = NewsletterKit;
 * 
 * export default function App() {
 *   return (
 *     <Provider config={config}>
 *       <Form />
 *       <Modal isOpen={isOpen} onClose={close} />
 *       <Toast status={status} />
 *     </Provider>
 *   );
 * }
 * ```
 */
export const NewsletterKit = {
  // Core components
  Provider: NewsletterProvider,
  Form: NewsletterForm,
  Modal: NewsletterModal,
  Toast: NewsletterToast,
  
  // Form variants
  FormMinimal: NewsletterFormMinimal,
  FormModern: NewsletterFormModern,
  FormOutlined: NewsletterFormOutlined,
  
  // Modal variants
  ModalSimple: NewsletterModalSimple,
  ModalModern: NewsletterModalModern,
  ModalPromo: NewsletterModalPromo,
  ModalTrigger: NewsletterModalTrigger,
  
  // Toast variants
  ToastSuccess: NewsletterToastSuccess,
  ToastError: NewsletterToastError,
  ToastContainer: NewsletterToastContainer,
  
  // Hooks
  useModal: useNewsletterModal,
  useToast: useNewsletterToast,
  useConfig: useNewsletterConfig,
  
  // Utilities
  showToast: showNewsletterToast,
} as const;

// ========================= DEFAULT EXPORT =========================
export default NewsletterKit;