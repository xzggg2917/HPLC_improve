import numpy as np
import matplotlib.pyplot as plt
from matplotlib import rcParams

# Set English font
rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans']
rcParams['axes.unicode_minus'] = False

# Define parameters
T = 10  # Total duration
y0 = 10  # Initial value
yT = 90  # Final value
t = np.linspace(0, T, 1000)  # Time points

# Create figure
plt.figure(figsize=(12, 8))

# Calculate all curves
curves = []

# 1. Pre-step Curve
y1 = np.full_like(t, yT)
y1[0] = y0
curves.append(('1. Pre-step Curve', y1, 'blue', '-'))

# 2. Weak Convex
y2 = yT - (yT - y0) * ((T - t) / T) ** 2
curves.append(('2. Weak Convex', y2, '#FF6B6B', '-'))

# 3. Medium Convex
y3 = yT - (yT - y0) * ((T - t) / T) ** 3
curves.append(('3. Medium Convex', y3, '#FF4444', '--'))

# 4. Strong Convex
y4 = yT - (yT - y0) * ((T - t) / T) ** 4
curves.append(('4. Strong Convex', y4, '#FF0000', '-.'))

# 5. Ultra Convex
y5 = yT - (yT - y0) * ((T - t) / T) ** 6
curves.append(('5. Ultra Convex', y5, '#CC0000', ':'))

# 6. Linear Curve
y6 = y0 + (yT - y0) * t / T
curves.append(('6. Linear Curve', y6, 'green', '-'))

# 7. Weak Concave
y7 = y0 + (yT - y0) * (t / T) ** 2
curves.append(('7. Weak Concave', y7, 'purple', '-'))

# 8. Medium Concave
y8 = y0 + (yT - y0) * (t / T) ** 3
curves.append(('8. Medium Concave', y8, '#9370DB', '--'))

# 9. Strong Concave
y9 = y0 + (yT - y0) * (t / T) ** 4
curves.append(('9. Strong Concave', y9, '#8B008B', '-.'))

# 10. Ultra Concave
y10 = y0 + (yT - y0) * (t / T) ** 6
curves.append(('10. Ultra Concave', y10, '#4B0082', ':'))

# 11. Post-step Curve
y11 = np.full_like(t, y0)
y11[-1] = yT
curves.append(('11. Post-step Curve', y11, 'orange', '-'))

# Plot all curves on one chart
for name, y, color, style in curves:
    plt.plot(t, y, color=color, linestyle=style, linewidth=2, label=name, alpha=0.8)

plt.xlabel('Time (min)', fontsize=12)
plt.ylabel('Mobile Phase A (%)', fontsize=12)
plt.title('11 Gradient Curve Types Comparison', fontsize=14, fontweight='bold')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)
plt.xlim(0, T)

# Add legend
plt.legend(loc='center left', bbox_to_anchor=(1, 0.5), fontsize=10, framealpha=0.9)

plt.tight_layout()

# Save figure
plt.savefig('frontend/public/gradient_curves.png', dpi=150, bbox_inches='tight')
print("English version gradient curves image saved to: frontend/public/gradient_curves.png")
plt.show()
