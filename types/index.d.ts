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
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
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
  dwollaCustomerId?: string;
  dwollaCustomerUrl?: string;
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
  $id?: string;
  $createdAt?: string;
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
  senderBankId?: string;
  receiverBankId?: string;
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

// ========================================
// Appwrite Document Shape
// ========================================

declare type AppwriteDoc = {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
};

declare type Bank = AppwriteDoc & {
  accountId: string;
  bankId: string;
  accessToken: string;
  fundingSourceUrl: string;
  userId: string;
  shareableId: string;
};

// ========================================
// Extended User (includes Appwrite fields)
// ========================================

declare type AppwriteUser = User &
  AppwriteDoc & {
    dwollaCustomerId: string;
    dwollaCustomerUrl: string;
  };

// ========================================
// Action Props
// ========================================

declare type getUserInfoProps = { userId: string };
declare type signInProps = { email: string; password: string };
declare type getBanksProps = { userId: string };
declare type getBankProps = { documentId: string };
declare type getBankByAccountIdProps = { accountId: string };
declare type getAccountsProps = { userId: string };
declare type getAccountProps = { appwriteItemId: string };
declare type getInstitutionProps = { institutionId: string };
declare type getTransactionsProps = { accessToken: string };
declare type getTransactionsByBankIdProps = { bankId: string };

declare type createBankAccountProps = {
  userId: string;
  bankId: string;
  accountId: string;
  accessToken: string;
  fundingSourceUrl: string;
  shareableId: string;
};

declare type exchangePublicTokenProps = {
  publicToken: string;
  user: User;
};

declare type CreateTransactionProps = {
  name: string;
  amount: number;
  senderId: string;
  senderBankId: string;
  receiverId: string;
  receiverBankId: string;
  email: string;
};

// ========================================
// Dwolla
// ========================================

declare type NewDwollaCustomerParams = {
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  dateOfBirth: string;
  ssn: string;
};

declare type CreateFundingSourceOptions = {
  customerId: string;
  fundingSourceName: string;
  plaidToken: string;
  _links?: Record<string, unknown>;
};

declare type TransferParams = {
  sourceFundingSourceUrl: string;
  destinationFundingSourceUrl: string;
  amount: string;
};

declare type AddFundingSourceParams = {
  dwollaCustomerId: string;
  processorToken: string;
  bankName: string;
};
