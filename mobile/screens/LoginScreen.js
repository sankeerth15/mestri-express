import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import axios from 'axios'

const API_URL = 'https://mestri-express.vercel.app'

export default function LoginScreen({ route }) {
  const { setIsLoggedIn } = route.params || {}
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async () => {
    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, { phone })
      setStep(2)
    } catch (error) {
      alert('Error sending OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        phone,
        otp,
      })
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user))
      setIsLoggedIn(true)
    } catch (error) {
      alert('Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          <Text style={styles.logo}>Mestri-Express</Text>
          <Text style={styles.tagline}>Quick delivery. Fast checkout.</Text>

          {step === 1 ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={[styles.button, !phone || phone.length !== 10 ? styles.buttonDisabled : {}]}
                onPress={handleSendOTP}
                disabled={phone.length !== 10 || loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.otpInfo}>We sent OTP to {phone}</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={[styles.button, !otp || otp.length !== 6 ? styles.buttonDisabled : {}]}
                onPress={handleVerifyOTP}
                disabled={otp.length !== 6 || loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setStep(1); setOtp('') }}>
                <Text style={styles.changePhone}>Change Phone</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ed',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#50AD41',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#50AD41',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  otpInfo: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  changePhone: {
    color: '#50AD41',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
})
