import { formatPrice } from '@/lib/utils'

// Base email template with styling
const getEmailLayout = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pak Perfection</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #eab308 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .tagline {
      color: #ffffff;
      font-size: 14px;
      margin: 8px 0 0 0;
      opacity: 0.95;
    }
    .content {
      padding: 40px 30px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 20px 0;
    }
    .subtitle {
      font-size: 16px;
      color: #6b7280;
      margin: 0 0 30px 0;
      line-height: 1.6;
    }
    .order-card {
      background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
      border-left: 5px solid #dc2626;
    }
    .order-id {
      font-size: 20px;
      font-weight: bold;
      color: #dc2626;
      margin: 0 0 15px 0;
    }
    .order-info {
      display: table;
      width: 100%;
      margin: 10px 0;
    }
    .info-row {
      display: table-row;
    }
    .info-label {
      display: table-cell;
      padding: 8px 0;
      color: #6b7280;
      font-weight: 600;
      width: 40%;
    }
    .info-value {
      display: table-cell;
      padding: 8px 0;
      color: #1f2937;
      font-weight: 500;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }
    .status-confirmed {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .status-preparing {
      background-color: #e9d5ff;
      color: #6b21a8;
    }
    .status-ready {
      background-color: #d1fae5;
      color: #065f46;
    }
    .status-delivered {
      background-color: #10b981;
      color: #ffffff;
    }
    .item {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 15px;
      margin: 12px 0;
      border: 1px solid #e5e7eb;
    }
    .item-name {
      font-weight: bold;
      color: #1f2937;
      font-size: 16px;
      margin: 0 0 5px 0;
    }
    .item-details {
      color: #6b7280;
      font-size: 14px;
      margin: 5px 0;
    }
    .item-price {
      color: #dc2626;
      font-weight: bold;
      font-size: 16px;
      margin: 8px 0 0 0;
    }
    .total-section {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 16px;
    }
    .total-row.final {
      border-top: 2px solid #dc2626;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 22px;
      font-weight: bold;
      color: #dc2626;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #dc2626 0%, #eab308 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .info-box {
      background-color: #fef3c7;
      border-left: 4px solid #eab308;
      padding: 20px;
      margin: 25px 0;
      border-radius: 6px;
    }
    .contact-section {
      background-color: #f9fafb;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
      text-align: center;
    }
    .contact-item {
      margin: 12px 0;
      color: #4b5563;
    }
    .contact-link {
      color: #dc2626;
      text-decoration: none;
      font-weight: 600;
    }
    .footer {
      background-color: #1f2937;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .footer-text {
      font-size: 14px;
      color: #d1d5db;
      margin: 8px 0;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-link {
      display: inline-block;
      margin: 0 8px;
      color: #ffffff;
      text-decoration: none;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">🍽️ Pak Perfection</h1>
      <p class="tagline">Authentic African & International Cuisine</p>
    </div>
    ${content}
    <div class="footer">
      <p class="footer-text">Thank you for choosing Pak Perfection!</p>
      <p class="footer-text">📍 1502 OAKLAND PKWY, LIMA, OH 45805</p>
      <p class="footer-text">📞 +1 (419) 516-8739 | ✉️ info@pakperfectioninter.com</p>
      <div class="social-links">
        <a href="#" class="social-link">Facebook</a> |
        <a href="#" class="social-link">Instagram</a> |
        <a href="#" class="social-link">Twitter</a>
      </div>
      <p class="footer-text" style="margin-top: 20px; font-size: 12px;">
        © ${new Date().getFullYear()} Pak Perfection. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`

// Order Confirmation Email Template
export const orderConfirmationTemplate = (order: any) => {
  const statusClass = `status-${order.status.toLowerCase().replace('_', '-')}`
  const itemsHtml = order.items?.map((item: any) => `
    <div class="item">
      <p class="item-name">${item.item_name}</p>
      <p class="item-details">Quantity: ${item.quantity}</p>
      ${item.modifiers && Object.keys(item.modifiers).length > 0 ? `
        <p class="item-details">Options: ${JSON.stringify(item.modifiers)}</p>
      ` : ''}
      <p class="item-price">${formatPrice(parseFloat(item.price))}</p>
    </div>
  `).join('') || ''

  const content = `
    <div class="content">
      <h2 class="title">🎉 Order Confirmed!</h2>
      <p class="subtitle">
        Thank you for your order! We've received it and our kitchen is getting ready to prepare your delicious meal.
      </p>

      <div class="order-card">
        <p class="order-id">Order #${order.id.slice(0, 8).toUpperCase()}</p>
        <div class="order-info">
          <div class="info-row">
            <span class="info-label">Order Date:</span>
            <span class="info-value">${new Date(order.created_at).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">
              <span class="status-badge ${statusClass}">${order.status.replace('_', ' ')}</span>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span class="info-value">${order.payment_method || 'Cash on Delivery'}</span>
          </div>
          ${order.delivery_address ? `
          <div class="info-row">
            <span class="info-label">Delivery Address:</span>
            <span class="info-value">${order.delivery_address}</span>
          </div>
          ` : ''}
        </div>
      </div>

      <h3 style="color: #1f2937; margin-top: 30px; margin-bottom: 15px;">Order Items:</h3>
      ${itemsHtml}

      <div class="total-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatPrice(parseFloat(order.subtotal))}</span>
        </div>
        ${order.delivery_fee > 0 ? `
        <div class="total-row">
          <span>Delivery Fee:</span>
          <span>${formatPrice(parseFloat(order.delivery_fee))}</span>
        </div>
        ` : ''}
        <div class="total-row">
          <span>Tax:</span>
          <span>${formatPrice(parseFloat(order.tax))}</span>
        </div>
        <div class="total-row final">
          <span>Total:</span>
          <span>${formatPrice(parseFloat(order.total))}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pakperfection.com'}/track-order" class="button">
          Track Your Order
        </a>
      </div>

      <div class="info-box">
        <p style="margin: 0; color: #92400e; font-weight: 600;">📱 Track Your Order</p>
        <p style="margin: 10px 0 0 0; color: #78350f;">
          You can track your order status anytime using Order ID: <strong>${order.id.slice(0, 8).toUpperCase()}</strong>
        </p>
      </div>

      <div class="contact-section">
        <h3 style="color: #1f2937; margin: 0 0 15px 0;">Need Help?</h3>
        <p class="contact-item">📞 Call us: <a href="tel:+14195168739" class="contact-link">+1 (419) 516-8739</a></p>
        <p class="contact-item">✉️ Email us: <a href="mailto:info@pakperfectioninter.com" class="contact-link">info@pakperfectioninter.com</a></p>
        <p class="contact-item">📍 Visit us: 1502 OAKLAND PKWY, LIMA, OH 45805</p>
      </div>
    </div>
  `

  return getEmailLayout(content)
}

// Order Status Update Email Template
export const orderStatusUpdateTemplate = (order: any, oldStatus: string) => {
  const statusClass = `status-${order.status.toLowerCase().replace('_', '-')}`
  const statusMessages: Record<string, { title: string; message: string; icon: string }> = {
    confirmed: {
      title: 'Order Confirmed! ✅',
      message: 'Great news! We\'ve confirmed your order and it\'s now being prepared by our chef.',
      icon: '✅'
    },
    preparing: {
      title: 'Preparing Your Order! 👨‍🍳',
      message: 'Our chef is working on your order right now. Fresh ingredients, authentic flavors!',
      icon: '👨‍🍳'
    },
    ready: {
      title: 'Order is Ready! 🎉',
      message: 'Your order is ready! If you\'re picking up, come and get it. If it\'s for delivery, our driver will be there soon!',
      icon: '🎉'
    },
    out_for_delivery: {
      title: 'Out for Delivery! 🚗',
      message: 'Your order is on its way! Our delivery driver is heading to your location now.',
      icon: '🚗'
    },
    delivered: {
      title: 'Order Delivered! 🎊',
      message: 'Your order has been delivered! We hope you enjoy your meal. Thank you for choosing Pak Perfection!',
      icon: '🎊'
    },
    completed: {
      title: 'Order Completed! 🌟',
      message: 'Your order has been completed! We hope you enjoyed your meal. We\'d love to hear your feedback!',
      icon: '🌟'
    },
    cancelled: {
      title: 'Order Cancelled ❌',
      message: 'Your order has been cancelled. If you have any questions, please contact us.',
      icon: '❌'
    }
  }

  const statusInfo = statusMessages[order.status.toLowerCase()] || {
    title: 'Order Status Updated',
    message: 'Your order status has been updated.',
    icon: '📦'
  }

  const content = `
    <div class="content">
      <h2 class="title">${statusInfo.icon} ${statusInfo.title}</h2>
      <p class="subtitle">
        ${statusInfo.message}
      </p>

      <div class="order-card">
        <p class="order-id">Order #${order.id.slice(0, 8).toUpperCase()}</p>
        <div class="order-info">
          <div class="info-row">
            <span class="info-label">Previous Status:</span>
            <span class="info-value">${oldStatus.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Current Status:</span>
            <span class="info-value">
              <span class="status-badge ${statusClass}">${order.status.replace('_', ' ')}</span>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Last Updated:</span>
            <span class="info-value">${new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pakperfection.com'}/track-order" class="button">
          Track Your Order
        </a>
      </div>

      ${order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'completed' ? `
      <div class="info-box">
        <p style="margin: 0; color: #92400e; font-weight: 600;">💝 We'd Love Your Feedback!</p>
        <p style="margin: 10px 0 0 0; color: #78350f;">
          Your experience matters to us! Share your thoughts and help us serve you better.
        </p>
      </div>
      ` : ''}

      <div class="contact-section">
        <h3 style="color: #1f2937; margin: 0 0 15px 0;">Questions or Concerns?</h3>
        <p class="contact-item">📞 Call us: <a href="tel:+14195168739" class="contact-link">+1 (419) 516-8739</a></p>
        <p class="contact-item">✉️ Email us: <a href="mailto:info@pakperfectioninter.com" class="contact-link">info@pakperfectioninter.com</a></p>
      </div>
    </div>
  `

  return getEmailLayout(content)
}

// Welcome Email Template (for new customers)
export const welcomeEmailTemplate = (name: string) => {
  const content = `
    <div class="content">
      <h2 class="title">Welcome to Pak Perfection! 🎉</h2>
      <p class="subtitle">
        Hi ${name}! We're thrilled to have you join our family of food lovers.
      </p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 20px 0;">
        At Pak Perfection, we bring you the authentic flavors of African and international cuisine, 
        crafted with love and the finest ingredients. Whether you're craving traditional African dishes 
        or exploring international flavors, we've got something special for you!
      </p>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pakperfection.com'}/menu" class="button">
          Explore Our Menu
        </a>
      </div>

      <div class="info-box">
        <p style="margin: 0; color: #92400e; font-weight: 600;">🎁 Special Offer!</p>
        <p style="margin: 10px 0 0 0; color: #78350f;">
          Enjoy 10% off your first order! Use code <strong>WELCOME10</strong> at checkout.
        </p>
      </div>

      <div class="contact-section">
        <h3 style="color: #1f2937; margin: 0 0 15px 0;">Connect With Us</h3>
        <p class="contact-item">📍 1502 OAKLAND PKWY, LIMA, OH 45805</p>
        <p class="contact-item">📞 +1 (419) 516-8739</p>
        <p class="contact-item">✉️ info@pakperfectioninter.com</p>
      </div>
    </div>
  `

  return getEmailLayout(content)
}

// Reservation Confirmation Email Template
export const reservationConfirmationTemplate = (reservation: any) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const content = `
    <div class="content">
      <h2 class="title">🎉 Reservation Confirmed!</h2>
      <p class="subtitle">
        Thank you for choosing Pak Perfection! We're excited to have you dine with us. Your reservation has been confirmed and we're looking forward to serving you.
      </p>

      <div class="order-card">
        <p class="order-id" style="color: #10b981;">Reservation Confirmed</p>
        <div class="order-info">
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${reservation.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">${formatDate(reservation.reservation_date)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time:</span>
            <span class="info-value">${reservation.reservation_time}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Number of Guests:</span>
            <span class="info-value">${reservation.guests} ${reservation.guests === 1 ? 'Guest' : 'Guests'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">
              <span class="status-badge status-confirmed">${reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}</span>
            </span>
          </div>
          ${reservation.special_requests ? `
          <div class="info-row">
            <span class="info-label">Special Requests:</span>
            <span class="info-value">${reservation.special_requests}</span>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="info-box" style="background-color: #dbeafe; border-left-color: #3b82f6;">
        <p style="margin: 0; color: #1e40af; font-weight: 600;">📞 What Happens Next?</p>
        <p style="margin: 10px 0 0 0; color: #1e3a8a; line-height: 1.6;">
          We'll call you within 24 hours to confirm your reservation details. If you need to make any changes or have questions, please don't hesitate to contact us.
        </p>
      </div>

      <div class="info-box">
        <p style="margin: 0; color: #92400e; font-weight: 600;">⏰ Arrival Tips</p>
        <ul style="margin: 10px 0 0 0; color: #78350f; padding-left: 20px; line-height: 1.8;">
          <li>Please arrive on time for your reservation</li>
          <li>If you're running late, give us a call at <strong>+1 (419) 516-8739</strong></li>
          <li>For large groups (8+), please call us directly</li>
          <li>We accommodate dietary restrictions - just let us know!</li>
        </ul>
      </div>

      <div class="contact-section">
        <h3 style="color: #1f2937; margin: 0 0 15px 0;">Need to Make Changes?</h3>
        <p class="contact-item">📞 Call us: <a href="tel:+14195168739" class="contact-link">+1 (419) 516-8739</a></p>
        <p class="contact-item">✉️ Email us: <a href="mailto:info@pakperfectioninter.com" class="contact-link">info@pakperfectioninter.com</a></p>
        <p class="contact-item">📍 Visit us: 1502 OAKLAND PKWY, LIMA, OH 45805</p>
      </div>

      <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
        <p style="margin: 0; color: #065f46; font-size: 18px; font-weight: bold;">
          We can't wait to serve you perfection! 🍽️
        </p>
        <p style="margin: 10px 0 0 0; color: #047857; font-size: 14px;">
          See you soon at Pak Perfection International Cuisine LLC
        </p>
      </div>
    </div>
  `

  return getEmailLayout(content)
}

// Event Booking Confirmation Email Template
export const eventBookingConfirmationTemplate = (booking: any) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const event = booking.events || booking.event
  const eventDate = event?.event_date ? new Date(event.event_date) : null

  const content = `
    <div class="content">
      <h2 class="title">🎉 Event Booking Confirmed!</h2>
      <p class="subtitle">
        Thank you for booking with Pak Perfection! We're excited to have you join us for this special event. Your booking has been confirmed and we're looking forward to seeing you there.
      </p>

      <div class="order-card">
        <p class="order-id" style="color: #10b981;">Booking Confirmed</p>
        <div class="order-info">
          <div class="info-row">
            <span class="info-label">Event:</span>
            <span class="info-value">${event?.title || 'Pak Perfection Event'}</span>
          </div>
          ${eventDate ? `
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">${formatDate(event.event_date)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time:</span>
            <span class="info-value">${formatTime(event.event_date)}</span>
          </div>
          ` : ''}
          ${event?.location ? `
          <div class="info-row">
            <span class="info-label">Location:</span>
            <span class="info-value">${event.location}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${booking.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${booking.email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value">${booking.phone}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Number of Guests:</span>
            <span class="info-value">${booking.guests} ${booking.guests === 1 ? 'Guest' : 'Guests'}</span>
          </div>
          ${event?.price !== null && event?.price > 0 ? `
          <div class="info-row">
            <span class="info-label">Total Amount:</span>
            <span class="info-value" style="font-weight: bold; color: #dc2626;">${formatPrice(event.price * booking.guests)}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">
              <span class="status-badge status-confirmed">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
            </span>
          </div>
          ${booking.special_requests ? `
          <div class="info-row">
            <span class="info-label">Special Requests:</span>
            <span class="info-value">${booking.special_requests}</span>
          </div>
          ` : ''}
        </div>
      </div>

      ${event?.description ? `
      <div class="info-box" style="background-color: #fef3c7; border-left-color: #f59e0b;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">📋 About This Event</p>
        <p style="margin: 10px 0 0 0; color: #78350f; line-height: 1.6;">
          ${event.description}
        </p>
      </div>
      ` : ''}

      <div class="info-box" style="background-color: #dbeafe; border-left-color: #3b82f6;">
        <p style="margin: 0; color: #1e40af; font-weight: 600;">📞 What Happens Next?</p>
        <p style="margin: 10px 0 0 0; color: #1e3a8a; line-height: 1.6;">
          Your booking is confirmed! We'll send you a reminder email closer to the event date. If you need to make any changes or have questions, please don't hesitate to contact us.
        </p>
      </div>

      <div class="info-box">
        <p style="margin: 0; color: #92400e; font-weight: 600;">⏰ Event Day Tips</p>
        <ul style="margin: 10px 0 0 0; color: #78350f; padding-left: 20px; line-height: 1.8;">
          <li>Please arrive on time for the event</li>
          <li>If you're running late, give us a call at <strong>+1 (419) 516-8739</strong></li>
          <li>Bring your confirmation email or booking reference</li>
          <li>We accommodate dietary restrictions - just let us know!</li>
        </ul>
      </div>

      <div class="contact-section">
        <h3 style="color: #1f2937; margin: 0 0 15px 0;">Need to Make Changes?</h3>
        <p class="contact-item">📞 Call us: <a href="tel:+14195168739" class="contact-link">+1 (419) 516-8739</a></p>
        <p class="contact-item">✉️ Email us: <a href="mailto:info@pakperfectioninter.com" class="contact-link">info@pakperfectioninter.com</a></p>
        <p class="contact-item">📍 Visit us: 1502 OAKLAND PKWY, LIMA, OH 45805</p>
      </div>

      <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
        <p style="margin: 0; color: #065f46; font-size: 18px; font-weight: bold;">
          We can't wait to see you at the event! 🎉
        </p>
        <p style="margin: 10px 0 0 0; color: #047857; font-size: 14px;">
          See you soon at Pak Perfection International Cuisine LLC
        </p>
      </div>
    </div>
  `

  return getEmailLayout(content)
}

// Contact Form Email Template
export const contactFormTemplate = (submission: any, type: 'customer' | 'admin' = 'customer') => {
  if (type === 'customer') {
    // Customer confirmation email
    const content = `
      <div class="content">
        <h2 class="title">📧 Thank You for Contacting Us!</h2>
        <p class="subtitle">
          We've received your message and will get back to you as soon as possible. Our team typically responds within 24 hours.
        </p>

        <div class="order-card">
          <p class="order-id" style="color: #10b981;">Message Received</p>
          <div class="order-info">
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${submission.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${submission.email}</span>
            </div>
            ${submission.phone ? `
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${submission.phone}</span>
            </div>
            ` : ''}
            ${submission.subject ? `
            <div class="info-row">
              <span class="info-label">Subject:</span>
              <span class="info-value">${submission.subject}</span>
            </div>
            ` : ''}
            ${submission.message ? `
            <div class="info-row" style="flex-direction: column; align-items: flex-start;">
              <span class="info-label" style="margin-bottom: 8px;">Your Message:</span>
              <span class="info-value" style="white-space: pre-wrap; line-height: 1.6;">${submission.message}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="info-box" style="background-color: #dbeafe; border-left-color: #3b82f6;">
          <p style="margin: 0; color: #1e40af; font-weight: 600;">⏱️ What Happens Next?</p>
          <p style="margin: 10px 0 0 0; color: #1e3a8a; line-height: 1.6;">
            Our team will review your message and respond to you at <strong>${submission.email}</strong> within 24 hours. For urgent matters, please call us directly.
          </p>
        </div>

        <div class="contact-section">
          <h3 style="color: #1f2937; margin: 0 0 15px 0;">Need Immediate Assistance?</h3>
          <p class="contact-item">📞 Call us: <a href="tel:+14195168739" class="contact-link">+1 (419) 516-8739</a></p>
          <p class="contact-item">✉️ Email us: <a href="mailto:info@pakperfectioninter.com" class="contact-link">info@pakperfectioninter.com</a></p>
          <p class="contact-item">📍 Visit us: 1502 OAKLAND PKWY, LIMA, OH 45805</p>
        </div>

        <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
          <p style="margin: 0; color: #065f46; font-size: 18px; font-weight: bold;">
            We appreciate your interest in Pak Perfection! 🙏
          </p>
          <p style="margin: 10px 0 0 0; color: #047857; font-size: 14px;">
            We look forward to serving you soon.
          </p>
        </div>
      </div>
    `
    return getEmailLayout(content)
  } else {
    // Admin notification email
    const content = `
      <div class="content">
        <h2 class="title">📬 New Contact Form Submission</h2>
        <p class="subtitle">
          You have received a new message through the contact form on your website.
        </p>

        <div class="order-card">
          <p class="order-id" style="color: #dc2626;">New Message</p>
          <div class="order-info">
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${submission.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value"><a href="mailto:${submission.email}" style="color: #3b82f6;">${submission.email}</a></span>
            </div>
            ${submission.phone ? `
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value"><a href="tel:${submission.phone}" style="color: #3b82f6;">${submission.phone}</a></span>
            </div>
            ` : ''}
            ${submission.subject ? `
            <div class="info-row">
              <span class="info-label">Subject:</span>
              <span class="info-value">${submission.subject}</span>
            </div>
            ` : ''}
            ${submission.message ? `
            <div class="info-row" style="flex-direction: column; align-items: flex-start;">
              <span class="info-label" style="margin-bottom: 8px;">Message:</span>
              <span class="info-value" style="white-space: pre-wrap; line-height: 1.6; background: #f3f4f6; padding: 12px; border-radius: 8px; width: 100%;">${submission.message}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Submitted:</span>
              <span class="info-value">${new Date(submission.created_at || Date.now()).toLocaleString('en-US')}</span>
            </div>
          </div>
        </div>

        <div class="info-box" style="background-color: #fef3c7; border-left-color: #f59e0b;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">💡 Quick Actions</p>
          <p style="margin: 10px 0 0 0; color: #78350f; line-height: 1.6;">
            Reply directly to this email or contact the customer at <a href="mailto:${submission.email}" style="color: #3b82f6;">${submission.email}</a>
            ${submission.phone ? ` or call <a href="tel:${submission.phone}" style="color: #3b82f6;">${submission.phone}</a>` : ''}.
          </p>
        </div>

        <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
          <p style="margin: 0; color: #1e40af; font-size: 16px; font-weight: bold;">
            View this submission in admin panel for full details and to mark as responded.
          </p>
        </div>
      </div>
    `
    return getEmailLayout(content)
  }
}

