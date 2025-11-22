import { Material, Employee } from '@shared/schema';
import { outlookIntegration } from '../integrations/outlook';
import type { IStorage } from '../storage';

export class StockMonitoringService {
  constructor(private storage: IStorage) {}

  // Check all materials for low stock levels
  async checkLowStock(): Promise<Material[]> {
    const materials = await this.storage.getMaterials();
    const lowStockItems = materials.filter(material => 
      material.currentStock <= material.minimumStock && material.isActive
    );
    
    return lowStockItems;
  }

  // Send stock alerts for low inventory items
  async sendStockAlerts(notifyRoles: string[] = ['Admin', 'SuperAdmin']): Promise<void> {
    const lowStockItems = await this.checkLowStock();
    
    if (lowStockItems.length === 0) {
      console.log('No low stock items found');
      return;
    }

    // Get employees to notify based on roles
    const employees = await this.storage.getEmployees();
    const recipientEmployees = employees.filter(emp => 
      emp.isActive && notifyRoles.includes(emp.role)
    );

    if (recipientEmployees.length === 0) {
      console.log('No active employees found to notify');
      return;
    }

    const recipientEmails = recipientEmployees.map(emp => emp.email);

    // Send individual alerts for each low stock item
    for (const material of lowStockItems) {
      try {
        await outlookIntegration.sendStockAlert(material, recipientEmails);
        console.log(`Stock alert sent for material: ${material.name} (SKU: ${material.sku})`);
      } catch (error) {
        console.error(`Failed to send stock alert for ${material.name}:`, error);
      }
    }

    // Also send a summary email
    await this.sendStockSummaryEmail(lowStockItems, recipientEmails);
  }

  // Send summary email with all low stock items
  private async sendStockSummaryEmail(materials: Material[], recipientEmails: string[]): Promise<void> {
    const subject = `⚠️ Stock Alert Summary: ${materials.length} Items Below Minimum`;
    
    const itemsList = materials.map(m => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${m.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${m.sku}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${m.currentStock}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${m.minimumStock}</td>
        <td style="padding: 8px; border: 1px solid #ddd; color: ${m.currentStock === 0 ? '#f44336' : '#ff9800'};">
          ${m.currentStock === 0 ? 'OUT OF STOCK' : `${m.minimumStock - m.currentStock} below minimum`}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background-color: #f44336; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">Stock Alert Summary</h2>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px;">
          <p><strong>Alert:</strong> The following ${materials.length} material(s) are below minimum stock levels:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white;">
            <thead>
              <tr style="background-color: #2196F3; color: white;">
                <th style="padding: 10px; text-align: left;">Material Name</th>
                <th style="padding: 10px; text-align: left;">SKU</th>
                <th style="padding: 10px; text-align: left;">Current Stock</th>
                <th style="padding: 10px; text-align: left;">Minimum Required</th>
                <th style="padding: 10px; text-align: left;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <p style="margin-top: 20px; color: #666;">
            <strong>Action Required:</strong> Please review and reorder these materials to avoid stockouts.
          </p>
          
          <a href="/employee/materials" style="display: inline-block; background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            View All Materials
          </a>
        </div>
      </div>
    `;

    for (const email of recipientEmails) {
      try {
        await outlookIntegration.sendEmail(email, subject, htmlContent);
      } catch (error) {
        console.error(`Failed to send summary email to ${email}:`, error);
      }
    }
  }

  // Update stock level after material usage
  async recordMaterialUsage(
    materialId: number,
    quantityUsed: number,
    employeeId: number,
    purpose?: string,
    clientReference?: string,
    notes?: string
  ): Promise<void> {
    // Get the material
    const material = await this.storage.getMaterial(materialId);
    if (!material) {
      throw new Error('Material not found');
    }

    // Check if there's enough stock
    if (material.currentStock < quantityUsed) {
      throw new Error(`Insufficient stock. Current stock: ${material.currentStock}, Requested: ${quantityUsed}`);
    }

    // Update the material stock
    const newStock = material.currentStock - quantityUsed;
    await this.storage.updateMaterial(materialId, {
      currentStock: newStock
    });

    // Record the usage
    await this.storage.createMaterialUsage({
      materialId,
      employeeId,
      quantityUsed,
      purpose,
      clientReference,
      notes
    });

    // Check if stock is now below minimum and send alert
    if (newStock <= material.minimumStock) {
      const employees = await this.storage.getEmployees();
      const adminEmails = employees
        .filter(emp => emp.isActive && (emp.role === 'Admin' || emp.role === 'SuperAdmin'))
        .map(emp => emp.email);

      if (adminEmails.length > 0) {
        const updatedMaterial = { ...material, currentStock: newStock };
        await outlookIntegration.sendStockAlert(updatedMaterial, adminEmails);
      }
    }
  }

  // Check and create automatic reorder suggestions
  async generateReorderSuggestions(): Promise<any[]> {
    const lowStockItems = await this.checkLowStock();
    const vendors = await this.storage.getVendors({ isActive: true });
    const materialPrices = await this.storage.getMaterialPrices();

    const suggestions = [];

    for (const material of lowStockItems) {
      // Find best vendor for this material
      const prices = materialPrices.filter(p => 
        p.materialId === material.id && p.isActive
      );

      if (prices.length > 0) {
        // Sort by price to find cheapest vendor
        prices.sort((a, b) => a.price - b.price);
        const bestPrice = prices[0];
        const vendor = vendors.find(v => v.id === bestPrice.vendorId);

        if (vendor) {
          // Calculate suggested order quantity (2x minimum stock)
          const suggestedQuantity = material.minimumStock * 2;
          const estimatedCost = suggestedQuantity * bestPrice.price;

          suggestions.push({
            material,
            vendor,
            suggestedQuantity,
            unitPrice: bestPrice.price,
            estimatedCost,
            currentStock: material.currentStock,
            minimumStock: material.minimumStock
          });
        }
      }
    }

    return suggestions;
  }

  // Schedule automatic stock checks (to be called by a cron job or scheduler)
  async performScheduledStockCheck(): Promise<void> {
    console.log('Performing scheduled stock check...');
    
    try {
      // Check for low stock and send alerts
      await this.sendStockAlerts();
      
      // Generate reorder suggestions
      const suggestions = await this.generateReorderSuggestions();
      
      if (suggestions.length > 0) {
        console.log(`Generated ${suggestions.length} reorder suggestions`);
        // Could send these suggestions via email or store them for review
      }
      
      console.log('Stock check completed successfully');
    } catch (error) {
      console.error('Error during scheduled stock check:', error);
    }
  }
}

// Export singleton instance
export const createStockMonitoringService = (storage: IStorage) => {
  return new StockMonitoringService(storage);
};