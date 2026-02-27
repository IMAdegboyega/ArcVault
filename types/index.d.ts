/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// ========================================
// Auth
// ========================================

declare type SignUpParams = {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  password: string;
};

declare type LoginUser = {
  email: string;
  password: string;
};

// ========================================
// User
// ========================================

declare type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  dateOfBirth?: string;
  paymentCustomerId?: string;
  createdAt: string;
};

// ========================================
// Accounts & Banks
// ========================================

declare type Account = {
  id: string;
  availableBalance: number;
  currentBalance: number;
  officialName: string;
  mask: string;
  name: string;
  type: string;
  subtype: string;
  shareableId: string;
  isoCurrencyCode?: string;
};

declare type AccountTypes =
  | "depository"
  | "credit"
  | "loan"
  | "investment"
  | "other";

// ========================================
// Transactions
// ========================================

declare type Transaction = {
  id: string;
  name: string;
  paymentChannel: string;
  amount: number;
  pending: boolean;
  category: string;
  date: string;
  image?: string;
  channel: string;
  merchantName?: string;
  bankAccountId: string;
};

// ========================================
// Transfers
// ========================================

declare type Transfer = {
  id: string;
  senderUserId: string;
  senderAccountId: string;
  receiverUserId: string;
  receiverAccountId: string;
  amount: number;
  description?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  email?: string;
  createdAt: string;
  senderAccount?: { name: string; mask: string };
  receiverAccount?: { name: string; mask: string };
};

// ========================================
// Categories
// ========================================

declare type Category = "Food and Drink" | "Travel" | "Transfer";

declare type CategoryCount = {
  name: string;
  count: number;
  totalCount: number;
};

// ========================================
// API Response
// ========================================

declare type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
};

// ========================================
// Component Props
// ========================================

declare interface CreditCardProps {
  account: Account;
  userName: string;
  showBalance?: boolean;
}

declare interface BankInfoProps {
  account: Account;
  selectedAccountId?: string;
  type: "full" | "card";
}

declare interface HeaderBoxProps {
  type?: "title" | "greeting";
  title: string;
  subtext: string;
  user?: string;
}

declare interface MobileNavProps {
  user: User;
}

declare interface PaginationProps {
  page: number;
  totalPages: number;
}

declare interface PlaidLinkProps {
  user: User;
  variant?: "primary" | "ghost";
}

declare interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

declare interface BankDropdownProps {
  accounts: Account[];
  setValue?: any;
  otherStyles?: string;
}

declare interface BankTabItemProps {
  account: Account;
  selectedAccountId?: string;
}

declare interface TotalBalanceBoxProps {
  accounts: Account[];
  totalBanks: number;
  totalCurrentBalance: number;
}

declare interface FooterProps {
  user: User;
  type?: "mobile" | "desktop";
}

declare interface RightSidebarProps {
  user: User;
  transactions: Transaction[];
  banks: Account[];
}

declare interface SiderbarProps {
  user: User;
}

declare interface RecentTransactionsProps {
  accounts: Account[];
  transactions: Transaction[];
  selectedAccountId: string;
  page: number;
}

declare interface CategoryBadgeProps {
  category: string;
}

declare interface TransactionTableProps {
  transactions: Transaction[];
}

declare interface CategoryProps {
  category: CategoryCount;
}

declare interface DoughnutChartProps {
  accounts: Account[];
}

declare interface PaymentTransferFormProps {
  accounts: Account[];
}
