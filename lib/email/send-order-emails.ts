import { sendEmail } from './config'
import { orderConfirmationTemplate, orderStatusUpdateTemplate } from './templates'

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order: any) => {
  try {
    if (!order.email) {
      console.error('Order email is missing')
      return { success: false, error: 'Order email is required' }
    }

    const orderNumber = order.order_number || order.id.slice(0, 8).toUpperCase()
    const html = orderConfirmationTemplate(order)
    const result = await sendEmail(
      order.email,
      `Order Confirmation - #${orderNumber} - Pak Perfection`,
      html
    )
    return result
  } catch (error: any) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

// Send order status update email
export const sendOrderStatusUpdateEmail = async (order: any, oldStatus: string) => {
  try {
    if (!order.email) {
      console.error('Order email is missing')
      return { success: false, error: 'Order email is required' }
    }

    const orderNumber = order.order_number || order.id.slice(0, 8).toUpperCase()
    const html = orderStatusUpdateTemplate(order, oldStatus)
    const statusText = (order.current_status || order.status || '').replace('_', ' ').toUpperCase()
    const result = await sendEmail(
      order.email,
      `Order Status Update: ${statusText} - #${orderNumber} - Pak Perfection`,
      html
    )
    return result
  } catch (error: any) {
    console.error('Error sending order status update email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

