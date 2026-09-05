import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native'
import axios from 'axios'

const API_URL = 'https://mestri-express.vercel.app'

export default function OrdersScreen() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      // TODO: Get userId from AsyncStorage
      // const response = await axios.get(`${API_URL}/api/orders/${userId}`)
      // setOrders(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#4169E1',
      out_for_delivery: '#9370DB',
      delivered: '#50AD41',
      cancelled: '#FF6347',
    }
    return colors[status] || '#999'
  }

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{item.order_number}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.order_status) },
          ]}
        >
          <Text style={styles.statusText}>
            {item.order_status?.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.orderDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>₹{item.total_amount?.toFixed(0)}</Text>
        <TouchableOpacity style={styles.trackButton}>
          <Text style={styles.trackButtonText}>Track →</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </SafeAreaView>
    )
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Start shopping to place your first order</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderOrder}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#50AD41',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#50AD41',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTopY: 8,
    marginTop: 8,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#50AD41',
  },
  trackButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8ed',
    borderRadius: 6,
  },
  trackButtonText: {
    color: '#50AD41',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  loadingText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
  },
})
