import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, FlatList, Image, Platform } from 'react-native';

// Sample menu data for the Kerala restaurant
const initialMenu = [
  // Using picsum.photos with random IDs for more distinct images
  { id: '1', name: 'Dosa', price: 40, imageUrl: 'https://picsum.photos/id/237/100/100' }, // Random image 237
  { id: '2', name: 'Chappathi', price: 15, imageUrl: 'https://picsum.photos/id/238/100/100' }, // Random image 238
  { id: '3', name: 'Masala Dosa', price: 60, imageUrl: 'https://picsum.photos/id/239/100/100' }, // Random image 239
  { id: '4', name: 'Meals (Veg)', price: 100, imageUrl: 'https://picsum.photos/id/240/100/100' }, // Random image 240
  { id: '5', name: 'Puttu & Kadala', price: 50, imageUrl: 'https://picsum.photos/id/241/100/100' }, // Random image 241
  { id: '6', name: 'Appam & Stew', price: 70, imageUrl: 'https://picsum.photos/id/242/100/100' }, // Random image 242
  { id: '7', name: 'Biryani (Chicken)', price: 150, imageUrl: 'https://picsum.photos/id/243/100/100' }, // Random image 243
];

// Main App component for the restaurant order taking application
const App = () => {
  const [menuItems, setMenuItems] = useState(initialMenu); // State to hold the menu items
  const [selectedMenuItem, setSelectedMenuItem] = useState(null); // State for the currently selected menu item for ordering
  const [quantity, setQuantity] = useState(''); // State for the quantity input
  const [currentOrder, setCurrentOrder] = useState([]); // State to hold the current customer's order
  const [message, setMessage] = useState(''); // State for displaying messages to the user
  const [showOrderSummary, setShowOrderSummary] = useState(false); // State to control order summary visibility

  // Calculate total amount of the current order
  const totalAmount = currentOrder.reduce((sum, item) => sum + item.subtotal, 0);

  // Function to handle adding a menu item to the current order
  const handleAddToOrder = () => {
    if (!selectedMenuItem || quantity === '') {
      setMessage('Please select a menu item and enter a quantity.');
      return;
    }
    const qtyValue = parseInt(quantity);
    if (isNaN(qtyValue) || qtyValue <= 0) {
      setMessage('Please enter a valid positive number for quantity.');
      return;
    }

    const existingItemIndex = currentOrder.findIndex(
      (item) => item.id === selectedMenuItem.id
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists in order
      const updatedOrder = [...currentOrder];
      updatedOrder[existingItemIndex].quantity += qtyValue;
      updatedOrder[existingItemIndex].subtotal =
        updatedOrder[existingItemIndex].quantity * selectedMenuItem.price;
      setCurrentOrder(updatedOrder);
      setMessage(`Added ${qtyValue} more ${selectedMenuItem.name}(s) to order.`);
    } else {
      // Add new item to order
      const newItem = {
        ...selectedMenuItem,
        quantity: qtyValue,
        subtotal: qtyValue * selectedMenuItem.price,
      };
      setCurrentOrder((prevOrder) => [...prevOrder, newItem]);
      setMessage(`${selectedMenuItem.name} (x${qtyValue}) added to order.`);
    }

    setSelectedMenuItem(null); // Clear selected menu item
    setQuantity(''); // Clear quantity input
  };

  // Function to handle removing an item from the order
  const handleRemoveItem = (itemId) => {
    setCurrentOrder((prevOrder) => prevOrder.filter((item) => item.id !== itemId));
    setMessage('Item removed from order.');
  };

  // Function to confirm the order
  const handleConfirmOrder = () => {
    if (currentOrder.length === 0) {
      setMessage('Your order is empty!');
      return;
    }
    // In a real app, this would send the order to a backend system
    setMessage(`Order confirmed! Total: ₹${totalAmount}. Thank you for your order!`);
    setCurrentOrder([]); // Clear the order after confirmation
    setSelectedMenuItem(null);
    setQuantity('');
    setShowOrderSummary(false); // Hide summary after confirmation
  };

  // Render item for FlatList to display each menu item
  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.menuItem, selectedMenuItem?.id === item.id && styles.selectedMenuItem]}
      onPress={() => {
        setSelectedMenuItem(item);
        setQuantity('1'); // Default quantity to 1 when selected
        setMessage(''); // Clear any previous messages
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.menuImage} />
      <View style={styles.menuDetails}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuPrice}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render item for FlatList to display current order items
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderItemText}>{item.name} x {item.quantity}</Text>
      <Text style={styles.orderItemSubtotal}>₹{item.subtotal}</Text>
      <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeItemButton}>
        <Text style={styles.removeItemText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  // Header component for the FlatList
  const ListHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Kerala Restaurant Order</Text>
      </View>

      {message && (
        <View style={[styles.messageBox, message.includes('confirmed') || message.includes('added') ? styles.successBox : styles.errorBox]}>
          <Text style={[styles.messageBoxText, message.includes('confirmed') || message.includes('added') ? styles.successText : styles.errorText]}>
            {message}
          </Text>
        </View>
      )}

      {/* Menu List Section Title */}
      <View style={[styles.listContainer, { marginBottom: 0, paddingBottom: 0, elevation: 0, shadowOpacity: 0 }]}>
        <Text style={styles.sectionTitle}>Our Menu</Text>
      </View>
    </View>
  );

  // Footer component for the FlatList (Order Quantity Input and Order Summary)
  const ListFooter = () => (
    <View>
      {/* Order Quantity Input Section */}
      {selectedMenuItem && (
        <View style={styles.orderInputSection}>
          <Text style={styles.sectionTitle}>Order {selectedMenuItem.name}</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity:</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
              aria-label="Quantity"
            />
          </View>
          <TouchableOpacity onPress={handleAddToOrder} style={styles.addButton}>
            <Text style={styles.buttonText}>Add to Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedMenuItem(null)}
            style={[styles.cancelButton, { marginTop: 10 }]}
          >
            <Text style={styles.cancelButtonText}>Cancel Selection</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Current Order Summary Section */}
      {currentOrder.length > 0 && (
        <View style={styles.orderSummarySection}>
          <TouchableOpacity
            onPress={() => setShowOrderSummary(!showOrderSummary)}
            style={styles.summaryToggle}
          >
            <Text style={styles.summaryTitle}>Your Order ({currentOrder.length} items) - Total: ₹{totalAmount}</Text>
            <Text style={styles.toggleIcon}>{showOrderSummary ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showOrderSummary && (
            <View>
              <FlatList
                data={currentOrder}
                renderItem={renderOrderItem}
                keyExtractor={item => item.id}
                style={styles.orderList}
                contentContainerStyle={styles.orderListContent}
                scrollEnabled={false} // This FlatList is meant to be non-scrollable as it's part of a footer
              />
              <TouchableOpacity onPress={handleConfirmOrder} style={styles.confirmOrderButton}>
                <Text style={styles.buttonText}>Confirm Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={item => item.id}
        numColumns={2} // Display menu items in 2 columns
        columnWrapperStyle={styles.row}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.flatListContentContainer}
        // No need for scrollEnabled={false} here, as FlatList manages its own scrolling
      />
    </SafeAreaView>
  );
};

// StyleSheet for defining component styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Adjust for Android status bar
  },
  flatListContentContainer: {
    paddingBottom: 20, // Add padding at the bottom of the scrollable content
  },
  header: {
    backgroundColor: '#FF6347', // Tomato color for restaurant theme
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  messageBox: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 15,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  successBox: {
    backgroundColor: '#e6ffe6', // Light green
  },
  errorBox: {
    backgroundColor: '#ffe6e6', // Light red
  },
  messageBoxText: {
    fontSize: 16,
    textAlign: 'center',
  },
  successText: {
    color: '#228B22', // Dark green
  },
  errorText: {
    color: '#CC0000', // Dark red
  },
  listContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    textAlign: 'center',
  },
  menuList: {
    // These styles are no longer directly on FlatList, but on its container in ListHeader/Footer
    // Keeping for reference if needed elsewhere or for future additions.
  },
  menuListContent: {
    justifyContent: 'space-between',
  },
  row: {
    justifyContent: 'space-around', // Space items evenly in a row
    // Margin for the whole row handled by menuItem's marginBottom
  },
  menuItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '48%', // Approx half width for two columns
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10, // Ensure spacing between rows
  },
  selectedMenuItem: {
    borderColor: '#FF6347', // Highlight color for selected item
    borderWidth: 2,
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#ddd', // Placeholder background
  },
  menuDetails: {
    alignItems: 'center',
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  menuPrice: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  orderInputSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 15,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555555',
    marginBottom: 8,
  },
  input: {
    height: 45,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#4CAF50', // Green add button
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#9E9E9E', // Grey cancel button
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  orderSummarySection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 15,
    marginBottom: 20,
  },
  summaryToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  toggleIcon: {
    fontSize: 18,
    color: '#333',
  },
  orderList: {
    maxHeight: 200, // Limit height to make it scrollable if many items
    marginBottom: 10,
  },
  orderListContent: {
    paddingBottom: 5,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  orderItemText: {
    fontSize: 16,
    color: '#333333',
    flex: 1, // Take up available space
  },
  orderItemSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555555',
    marginLeft: 10,
  },
  removeItemButton: {
    backgroundColor: '#E57373', // Light red for remove button
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  removeItemText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmOrderButton: {
    backgroundColor: '#FF6347', // Tomato color for confirm button
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
});

export default App;
