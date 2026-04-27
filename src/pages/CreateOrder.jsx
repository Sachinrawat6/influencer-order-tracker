import { useNavigate } from 'react-router-dom';
import OrderForm from '../components/OrderForm';

export default function CreateOrder() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Create New Order</h1>
        <p className="text-slate-500 mt-1">
          Enter the style, size and influencer details. The order will move to the
          pending queue for processing.
        </p>
      </div>

      <OrderForm onCreated={() => navigate('/pending')} />
    </div>
  );
}
