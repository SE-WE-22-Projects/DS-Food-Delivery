import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>About Foodly</CardTitle>
          <CardDescription>Your go-to food delivery service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            At <strong>Foodly</strong>, we believe that great food is the heart of every
            community. Since our founding in 2020, we’ve partnered with local restaurants
            to bring fresh, delicious meals right to your door—in under 30 minutes.
          </p>
          <h3 className="text-lg font-semibold">Our Mission</h3>
          <p>
            To empower neighborhoods by delivering tasty, high-quality meals quickly
            and reliably—supporting small businesses and making every bite count.
          </p>
          <h3 className="text-lg font-semibold">Why Choose Us?</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>🚀 Lightning-fast delivery</li>
            <li>🍽️ Hand-picked local restaurants</li>
            <li>💚 Sustainable, eco-friendly packaging</li>
            <li>⭐ 24/7 customer support</li>
          </ul>
          <div className="pt-4">
            <Button asChild>
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
