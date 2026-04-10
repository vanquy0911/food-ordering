const Address = require("../models/address");
const User = require("../models/user");

/**
 * Address Service
 * Handles business logic for user delivery addresses
 */
class AddressService {
    /**
     * Get all addresses for a user
     * @param {String} userId - User ID
     * @returns {Object} - List of addresses
     */
    async getAddresses(userId) {
        const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
        return {
            success: true,
            count: addresses.length,
            data: { addresses }
        };
    }

    /**
     * Create new address
     * @param {String} userId - User ID
     * @param {Object} addressData - New address data
     * @param {Object} session - Mongoose session for transaction (optional)
     * @returns {Object} - Created address
     */
    async createAddress(userId, addressData, session = null) {
        // If this is the user's first address, make it default
        const addressCount = await Address.countDocuments({ user: userId }).session(session);
        if (addressCount === 0) {
            addressData.isDefault = true;
        } else if (addressData.isDefault) {
            // Unset other default addresses for this user
            await Address.updateMany({ user: userId }, { isDefault: false }, { session });
        }

        const [address] = await Address.create([{
            ...addressData,
            user: userId
        }], { session });

        // Add to user's addresses array
        await User.findByIdAndUpdate(userId, {
            $push: { addresses: address._id }
        }, { session });

        return {
            success: true,
            message: "Address added successfully",
            data: { address }
        };
    }

    /**
     * Update address
     * @param {String} userId - User ID
     * @param {String} addressId - Address ID
     * @param {Object} updateData - Data to update
     * @returns {Object} - Updated address
     */
    async updateAddress(userId, addressId, updateData) {
        const address = await Address.findOne({ _id: addressId, user: userId });
        if (!address) {
            const error = new Error("Address not found or unauthorized");
            error.statusCode = 404;
            throw error;
        }

        // If setting as default, unset others first
        if (updateData.isDefault && !address.isDefault) {
            await Address.updateMany({ user: userId }, { isDefault: false });
        }

        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return {
            success: true,
            message: "Address updated successfully",
            data: { address: updatedAddress }
        };
    }

    /**
     * Delete address
     * @param {String} userId - User ID
     * @param {String} addressId - Address ID
     * @returns {Object} - Success message
     */
    async deleteAddress(userId, addressId) {
        const address = await Address.findOne({ _id: addressId, user: userId });
        if (!address) {
            const error = new Error("Address not found or unauthorized");
            error.statusCode = 404;
            throw error;
        }

        const wasDefault = address.isDefault;
        await Address.findByIdAndDelete(addressId);

        // Remove from user's addresses array
        await User.findByIdAndUpdate(userId, {
            $pull: { addresses: addressId }
        });

        // If deleted address was default, pick another one if exists
        if (wasDefault) {
            const nextAddress = await Address.findOne({ user: userId });
            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        return {
            success: true,
            message: "Address deleted successfully"
        };
    }
}

module.exports = new AddressService();