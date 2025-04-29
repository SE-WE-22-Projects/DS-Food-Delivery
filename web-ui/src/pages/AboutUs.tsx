import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutUs() {
  return (
    <div className="w-full py-12 px-4 space-y-12">
      {/* Hero section: text + image */}
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Text content */}
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold">About Foodly</h2>
          <p>
            At <strong>Foodly</strong>, we believe that great food is the heart of every community.
            Since our founding in 2020, we’ve partnered with local restaurants to bring fresh,
            delicious meals right to your door—in under 30 minutes.
          </p>
          <h3 className="text-xl font-semibold">Our Mission</h3>
          <p>
            To empower neighborhoods by delivering tasty, high-quality meals quickly and
            reliably—supporting small businesses and making every bite count.
          </p>
          <h3 className="text-xl font-semibold">Why Choose Us?</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>🚀 Lightning-fast delivery</li>
            <li>🍽️ Hand-picked local restaurants</li>
            <li>💚 Sustainable, eco-friendly packaging</li>
            <li>⭐ 24/7 customer support</li>
          </ul>
          <div className="pt-4">
            <Button asChild>
              <a href="/contact">Get in Touch</a>
            </Button>
          </div>
        </div>
        {/* Image */}
        <div className="flex-1">
          <img
            src="https://source.unsplash.com/600x400/?delivery,team,thumbs-up"
            alt="Delivery team giving thumbs up"
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
      </div>

      {/* Reviews section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-center">What Our Customers Say</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md">
            <CardContent>
              <p className="italic">
                "Foodly made my dinner hour stress-free. The delivery was quick, and the food
                arrived hot and fresh!"
              </p>
              <p className="mt-4 font-semibold">— Jane Doe, New York</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent>
              <p className="italic">
                "I love supporting local restaurants through Foodly. Each order feels like a win
                for my community."
              </p>
              <p className="mt-4 font-semibold">— Carlos M., San Francisco</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent>
              <p className="italic">
                "Exceptional service and eco-friendly packaging. Foodly is my go-to for
                convenient meals."
              </p>
              <p className="mt-4 font-semibold">— Aisha K., London</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
