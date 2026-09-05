import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native'
import axios from 'axios'

const API_URL = 'https://mestri-express.vercel.app'

export default function ProductsScreen({ navigation, route }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const categoryId = route?.params?.category

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, categoryId])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        q: searchQuery,
        ...(categoryId && { category: categoryId }),
        limit: 100,
      })
      const response = await axios.get(
        `${API_URL}/api/products/search?${params}`
      )
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.productImage}>
        <Text style={styles.productImageText}>📦</Text>
      </View>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productPrice}>₹{item.selling_price}</Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search materials..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <Text>Loading products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContent}>
          <Text>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          renderItem={renderProduct}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  productGrid: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginHorizontal: '1%',
    marginBottom: 12,
    padding: 8,
  },
  productImage: {
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImageText: {
    fontSize: 32,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    height: 32,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#50AD41',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#50AD41',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
