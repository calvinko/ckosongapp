/**
 * Payments object to record
 */
export interface Payment {
  /**
   * The payment ID
   */
  paymentId: string
  /**
   * Payment Type (e.g. "PAYPAL")
   */
  type: string
  /**
   * Email of the user
   */
  email?: string
  /**
   * Payment Create Time (ISO 8601 UTC)
   */
  paymentCreatedTime: string // create_time
  /**
   * Payment Updated Time (ISO 8601 UTC)
   */
  paymentUpdatedTime: string // update_time
  /**
   * Payer ID
   */
  payerId?: string // payer.payer_id
  /**
   * Payer Full Name
   */
  payerName?: string // payer.name.given_name + payer.name.surname
  /**
   * Payer Email Address
   */
  payerEmail?: string // payer.email_address
  /**
   * Payment status
   */
  paymentStatus?: string

  /**
   * timestamp of this record (ISO 8601 UTC)
   */
  timestamp?: String,
  /**
   * the purchase units
   */
  purchaseUnits?: PurchaseUnit[] // purchase_units
};


/**
 * Payment Item
 */
export interface PaymentItem {
  name: string;
  quantity: string;
  amount: string;
  currency: string;
  sku?: string;
  category?: string;
}

/**
 * A Purchase Unit
 */
export interface PurchaseUnit {
  amount?: string // amount.value
  currencyCode?: string // amount.currency_code
  payeeEmail?: string // payee.email_address
  payeeMerchantId?: string // payee.merchant_id
};